import { useMemo, useState, type FormEvent } from 'react';
import { track } from '../lib/tracking/events';
import {
  contactChannels,
  contactReasons,
  entityLabels,
  entityTypes,
  parseContactBody,
  reasonLabels,
  type ContactInput
} from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
  initialReason?: ContactInput['reason'];
  initialModules?: string;
};

const inputClass =
  'mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function ContactForm({
  successMessage,
  errorMessage,
  turnstileSiteKey,
  initialReason = 'informacionCliente',
  initialModules = ''
}: Props) {
  const [status, setStatus] = useState<
    'idle' | 'ok' | 'error' | 'rate_limited' | 'unavailable' | 'loading'
  >('idle');
  const [fieldError, setFieldError] = useState(false);
  const [form, setForm] = useState({
    name: '',
    entityType: 'particular' as ContactInput['entityType'],
    channel: 'correo' as ContactInput['channel'],
    phone: '',
    email: '',
    reason: initialReason,
    modules: initialModules,
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  const showPhone = form.channel === 'whatsapp';
  const showEmail = form.channel === 'correo';

  const channelLabel = useMemo(
    () => (form.channel === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'),
    [form.channel]
  );

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      entityType: form.entityType,
      channel: form.channel,
      phone: form.phone || undefined,
      email: form.email || undefined,
      reason: form.reason,
      modules: form.modules || undefined,
      consent: form.consent as true,
      honeypot: form.honeypot,
      turnstileToken: turnstileToken || undefined
    };
    const parsed = parseContactBody(payload);
    if (!parsed.success) {
      setFieldError(true);
      return;
    }
    setFieldError(false);
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
      <div>
        <label htmlFor="contact-name" className="text-sm">
          Nombre completo*
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

      <div>
        <label htmlFor="contact-entity" className="text-sm">
          Tipo*
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

      {showPhone && (
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

      {showEmail && (
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

      <div>
        <label htmlFor="contact-reason" className="text-sm">
          Motivo de la petición*
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

      {form.modules ? (
        <p className="text-sm text-muted">
          Módulos indicados: <strong className="text-fg">{form.modules}</strong>
        </p>
      ) : null}

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

      {fieldError && (
        <p role="alert" className="text-sm text-danger">
          Revisa los campos obligatorios. Para {channelLabel} falta el dato de contacto.
        </p>
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

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  );
}
