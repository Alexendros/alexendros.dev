import { useEffect, useState, type FormEvent } from 'react';
import { track } from '../lib/tracking/events';
import {
  contactChannels,
  contactReasons,
  entityLabels,
  entityTypes,
  formatContactFieldErrors,
  parseContactBody,
  reasonLabels,
  type ContactInput,
  type FieldError
} from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
};

const inputClass =
  'mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

type Step = 'reason' | 'name' | 'entity' | 'channel' | 'message' | 'consent';

const STEPS: Step[] = ['reason', 'name', 'entity', 'channel', 'message', 'consent'];

function reasonFromSearch(value: string | null): ContactInput['reason'] {
  if (value && (contactReasons as readonly string[]).includes(value)) {
    return value as ContactInput['reason'];
  }
  return 'informacionCliente';
}

function stepValid(
  step: Step,
  form: {
    name: string;
    entityType: ContactInput['entityType'];
    channel: ContactInput['channel'];
    phone: string;
    email: string;
    reason: ContactInput['reason'];
    message: string;
    consent: boolean;
  }
): boolean {
  switch (step) {
    case 'reason':
      return Boolean(form.reason);
    case 'name':
      return form.name.trim().length >= 2;
    case 'entity':
      return Boolean(form.entityType);
    case 'channel':
      if (form.channel === 'whatsapp') return form.phone.trim().length >= 9;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    case 'message':
      return form.message.trim().length >= 10;
    case 'consent':
      return form.consent;
    default:
      return false;
  }
}

export default function ContactForm({ successMessage, errorMessage, turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<
    'idle' | 'ok' | 'error' | 'rate_limited' | 'unavailable' | 'loading'
  >('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    name: '',
    entityType: 'particular' as ContactInput['entityType'],
    channel: 'correo' as ContactInput['channel'],
    phone: '',
    email: '',
    reason: 'informacionCliente' as ContactInput['reason'],
    message: '',
    modules: '',
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = reasonFromSearch(params.get('motivo'));
    const modules = params.get('modulos') ?? '';
    setForm((prev) => ({
      ...prev,
      reason,
      modules
    }));
  }, []);

  const step = STEPS[stepIndex] ?? 'reason';
  const isLast = stepIndex === STEPS.length - 1;

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const goNext = () => {
    setFieldErrors([]);
    if (!stepValid(step, form)) {
      const labelMap: Record<Step, string> = {
        reason: 'Motivo',
        name: 'Nombre',
        entity: 'Categoría',
        channel: form.channel === 'whatsapp' ? 'Teléfono WhatsApp' : 'Correo electrónico',
        message: 'Tu petición',
        consent: 'Consentimiento'
      };
      const fieldMap: Record<Step, string> = {
        reason: 'reason',
        name: 'name',
        entity: 'entityType',
        channel: form.channel === 'whatsapp' ? 'phone' : 'email',
        message: 'message',
        consent: 'consent'
      };
      setFieldErrors([
        {
          field: fieldMap[step],
          label: labelMap[step],
          cause:
            step === 'channel' && form.channel === 'correo' && form.email.trim()
              ? 'formato no válido'
              : 'falta contenido'
        }
      ]);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setFieldErrors([]);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }
    const payload = {
      name: form.name,
      entityType: form.entityType,
      channel: form.channel,
      phone: form.phone || undefined,
      email: form.email || undefined,
      reason: form.reason,
      message: form.message,
      modules: form.modules || undefined,
      consent: form.consent as true,
      honeypot: form.honeypot,
      turnstileToken: turnstileToken || undefined
    };
    const parsed = parseContactBody(payload);
    if (!parsed.success) {
      setFieldErrors(formatContactFieldErrors(parsed.error));
      return;
    }
    setFieldErrors([]);
    setStatus('loading');
    track('form_submit');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (res.status === 429) {
        setStatus('rate_limited');
        resetTurnstile();
        return;
      }
      if (res.status === 503) {
        setStatus('unavailable');
        resetTurnstile();
        return;
      }
      if (!res.ok) {
        setStatus('error');
        resetTurnstile();
        return;
      }
      setStatus('ok');
      track('contact_form_success');
    } catch {
      setStatus('error');
      resetTurnstile();
    }
  };

  if (status === 'ok') {
    return (
      <p role="status" className="rounded-lg border border-primarySoft bg-primaryGhost p-4 text-sm">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-xs font-mono text-muted">
        Paso {stepIndex + 1} de {STEPS.length}
      </p>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Sitio web</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm((f) => ({ ...f, honeypot: e.target.value }))}
        />
      </div>

      {form.modules ? (
        <p className="text-sm text-muted">
          Módulos indicados: <strong className="text-fg">{form.modules}</strong>
        </p>
      ) : null}

      {step === 'reason' && (
        <div>
          <label htmlFor="contact-reason" className="text-sm">
            Motivo*
          </label>
          <select
            id="contact-reason"
            name="reason"
            className={inputClass}
            value={form.reason}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                reason: e.target.value as ContactInput['reason']
              }))
            }
          >
            {contactReasons.map((r) => (
              <option key={r} value={r}>
                {reasonLabels[r]}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 'name' && (
        <div>
          <label htmlFor="contact-name" className="text-sm">
            Nombre*
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      )}

      {step === 'entity' && (
        <div>
          <label htmlFor="contact-entity" className="text-sm">
            Categoría*
          </label>
          <select
            id="contact-entity"
            name="entityType"
            className={inputClass}
            value={form.entityType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                entityType: e.target.value as ContactInput['entityType']
              }))
            }
          >
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {entityLabels[t]}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 'channel' && (
        <>
          <fieldset>
            <legend className="text-sm">Canal de preferencia para respuesta*</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {contactChannels.map((ch) => (
                <label key={ch} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="channel"
                    value={ch}
                    checked={form.channel === ch}
                    onChange={() => setForm((f) => ({ ...f, channel: ch }))}
                  />
                  {ch === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'}
                </label>
              ))}
            </div>
          </fieldset>
          {form.channel === 'whatsapp' && (
            <div>
              <label htmlFor="contact-phone" className="text-sm">
                Teléfono WhatsApp*
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          )}
          {form.channel === 'correo' && (
            <div>
              <label htmlFor="contact-email" className="text-sm">
                Correo electrónico*
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          )}
        </>
      )}

      {step === 'message' && (
        <div>
          <label htmlFor="contact-message" className="text-sm">
            Tu petición*
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            className={inputClass}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Describe qué necesitas o qué quieres preguntar."
          />
        </div>
      )}

      {step === 'consent' && (
        <>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              className="mt-1"
            />
            <span>
              Acepto el tratamiento de mis datos para responder a esta petición según la{' '}
              <a href="/privacidad" className="underline decoration-dotted underline-offset-2">
                política de privacidad
              </a>
              .
            </span>
          </label>
          {turnstileSiteKey ? (
            <TurnstileWidget
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              onToken={setTurnstileToken}
            />
          ) : null}
        </>
      )}

      {fieldErrors.length > 0 && (
        <ul role="alert" className="space-y-1 text-sm text-danger">
          {fieldErrors.map((err) => (
            <li key={err.field}>
              {err.label}: {err.cause}
            </li>
          ))}
        </ul>
      )}
      {status === 'error' && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}
      {status === 'rate_limited' && (
        <p role="alert" className="text-sm text-danger">
          Demasiados intentos. Espera un minuto e inténtalo de nuevo.
        </p>
      )}
      {status === 'unavailable' && (
        <p role="alert" className="text-sm text-danger">
          Servicio temporalmente no disponible. Escríbeme a contratacion@alexendros.dev.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Atrás
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Continuar
          </button>
        )}
        {isLast && (
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            {status === 'loading' ? 'Enviando…' : 'Enviar'}
          </button>
        )}
      </div>
    </form>
  );
}
