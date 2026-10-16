import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { track } from '../lib/tracking/events';
import {
  CONTACT_WIZARD_STEPS,
  contactChannels,
  contactReasons,
  entityLabels,
  entityTypes,
  formatContactFieldErrors,
  parseContactBody,
  reasonLabels,
  stepIndexForField,
  validateContactStep,
  type ContactInput,
  type ContactWizardStep,
  type FieldError
} from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
};

const SUBMIT_TIMEOUT_MS = 25_000;

const inputClass =
  'mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function reasonFromSearch(value: string | null): ContactInput['reason'] {
  if (value && (contactReasons as readonly string[]).includes(value)) {
    return value as ContactInput['reason'];
  }
  return 'informacionCliente';
}

function errorFor(field: string, errors: FieldError[]): FieldError | undefined {
  return errors.find((e) => e.field === field);
}

export default function ContactForm({ successMessage, errorMessage, turnstileSiteKey }: Props) {
  const formId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const inFlightRef = useRef(false);
  const [status, setStatus] = useState<
    'idle' | 'ok' | 'error' | 'rate_limited' | 'unavailable' | 'loading' | 'timeout'
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const params = new URLSearchParams(window.location.search);
    const reason = reasonFromSearch(params.get('motivo'));
    const modules = params.get('modulos') ?? '';
    setForm((prev) => ({
      ...prev,
      reason,
      modules
    }));
  }, []);

  const step: ContactWizardStep = CONTACT_WIZARD_STEPS[stepIndex] ?? 'reason';
  const isLast = stepIndex === CONTACT_WIZARD_STEPS.length - 1;
  const sending = status === 'loading';

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const focusStep = () => {
    requestAnimationFrame(() => {
      stepHeadingRef.current?.focus();
    });
  };

  const focusField = (field: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`contact-${field}`);
      if (el instanceof HTMLElement) {
        el.focus();
        return;
      }
      stepHeadingRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!hydrated) return;
    focusStep();
  }, [stepIndex, hydrated]);

  useEffect(() => {
    if (status === 'ok') {
      requestAnimationFrame(() => successRef.current?.focus());
    }
  }, [status]);

  const goNext = () => {
    if (sending) return;
    const errors = validateContactStep(step, form);
    if (errors.length) {
      setFieldErrors(errors);
      focusField(errors[0]?.field ?? '');
      return;
    }
    setFieldErrors([]);
    setStepIndex((i) => Math.min(i + 1, CONTACT_WIZARD_STEPS.length - 1));
  };

  const goBack = () => {
    if (sending) return;
    setFieldErrors([]);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const fieldDescribedBy = (field: string, err?: FieldError) => {
    if (!err) return undefined;
    return `${formId}-${field}-error`;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }
    if (inFlightRef.current || sending) return;

    const consentErrors = validateContactStep('consent', form);
    if (consentErrors.length) {
      setFieldErrors(consentErrors);
      focusField('consent');
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
      const errors = formatContactFieldErrors(parsed.error);
      setFieldErrors(errors);
      if (errors[0]) {
        setStepIndex(stepIndexForField(errors[0].field));
        focusField(errors[0].field);
      }
      return;
    }
    setFieldErrors([]);
    inFlightRef.current = true;
    setStatus('loading');
    track('form_submit');

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    const idempotencyKey =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `contact-${Date.now()}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(parsed.data),
        signal: controller.signal
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
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('timeout');
      } else {
        setStatus('error');
      }
      resetTurnstile();
    } finally {
      window.clearTimeout(timer);
      inFlightRef.current = false;
    }
  };

  if (status === 'ok') {
    return (
      <p
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rounded-lg border border-primarySoft bg-primaryGhost p-4 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {successMessage}
      </p>
    );
  }

  const reasonErr = errorFor('reason', fieldErrors);
  const nameErr = errorFor('name', fieldErrors);
  const entityErr = errorFor('entityType', fieldErrors);
  const channelErr = errorFor('channel', fieldErrors);
  const phoneErr = errorFor('phone', fieldErrors);
  const emailErr = errorFor('email', fieldErrors);
  const messageErr = errorFor('message', fieldErrors);
  const consentErr = errorFor('consent', fieldErrors);

  const stepTitles: Record<ContactWizardStep, string> = {
    reason: 'Motivo de la consulta',
    name: 'Tu nombre',
    entity: 'Categoría',
    channel: 'Canal de respuesta',
    message: 'Tu petición',
    consent: 'Consentimiento y envío'
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate aria-busy={sending}>
      {!hydrated ? (
        <p className="text-sm text-muted" role="status">
          Preparando el formulario…
        </p>
      ) : null}

      <p className="text-xs font-mono text-muted">
        Paso {stepIndex + 1} de {CONTACT_WIZARD_STEPS.length}
      </p>

      <h2
        id={`${formId}-step-title`}
        ref={stepHeadingRef}
        tabIndex={-1}
        className="text-base font-bold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {stepTitles[step]}
      </h2>

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
          <select
            id="contact-reason"
            name="reason"
            className={inputClass}
            value={form.reason}
            aria-labelledby={`${formId}-step-title`}
            aria-required="true"
            aria-invalid={reasonErr ? true : undefined}
            aria-describedby={fieldDescribedBy('reason', reasonErr)}
            disabled={sending}
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
          {reasonErr ? (
            <p id={`${formId}-reason-error`} className="mt-1 text-sm text-danger">
              {reasonErr.cause}
            </p>
          ) : null}
        </div>
      )}

      {step === 'name' && (
        <div>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            className={inputClass}
            value={form.name}
            aria-labelledby={`${formId}-step-title`}
            aria-required="true"
            aria-invalid={nameErr ? true : undefined}
            aria-describedby={fieldDescribedBy('name', nameErr)}
            disabled={sending}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {nameErr ? (
            <p id={`${formId}-name-error`} className="mt-1 text-sm text-danger">
              {nameErr.cause}
            </p>
          ) : null}
        </div>
      )}

      {step === 'entity' && (
        <div>
          <select
            id="contact-entity"
            name="entityType"
            className={inputClass}
            value={form.entityType}
            aria-labelledby={`${formId}-step-title`}
            aria-required="true"
            aria-invalid={entityErr ? true : undefined}
            aria-describedby={fieldDescribedBy('entityType', entityErr)}
            disabled={sending}
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
          {entityErr ? (
            <p id={`${formId}-entityType-error`} className="mt-1 text-sm text-danger">
              {entityErr.cause}
            </p>
          ) : null}
        </div>
      )}

      {step === 'channel' && (
        <>
          <fieldset disabled={sending} aria-invalid={channelErr ? true : undefined}>
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
            {channelErr ? (
              <p id={`${formId}-channel-error`} className="mt-1 text-sm text-danger">
                {channelErr.cause}
              </p>
            ) : null}
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
                aria-invalid={phoneErr ? true : undefined}
                aria-describedby={fieldDescribedBy('phone', phoneErr)}
                disabled={sending}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              {phoneErr ? (
                <p id={`${formId}-phone-error`} className="mt-1 text-sm text-danger">
                  {phoneErr.cause}
                </p>
              ) : null}
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
                aria-invalid={emailErr ? true : undefined}
                aria-describedby={fieldDescribedBy('email', emailErr)}
                disabled={sending}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {emailErr ? (
                <p id={`${formId}-email-error`} className="mt-1 text-sm text-danger">
                  {emailErr.cause}
                </p>
              ) : null}
            </div>
          )}
        </>
      )}

      {step === 'message' && (
        <div>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            className={inputClass}
            value={form.message}
            aria-labelledby={`${formId}-step-title`}
            aria-required="true"
            aria-invalid={messageErr ? true : undefined}
            aria-describedby={fieldDescribedBy('message', messageErr)}
            disabled={sending}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Describe qué necesitas o qué quieres preguntar."
          />
          {messageErr ? (
            <p id={`${formId}-message-error`} className="mt-1 text-sm text-danger">
              {messageErr.cause}
            </p>
          ) : null}
        </div>
      )}

      {step === 'consent' && (
        <>
          <label className="flex items-start gap-2 text-sm" htmlFor="contact-consent">
            <input
              id="contact-consent"
              type="checkbox"
              name="consent"
              checked={form.consent}
              aria-invalid={consentErr ? true : undefined}
              aria-describedby={fieldDescribedBy('consent', consentErr)}
              disabled={sending}
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
          {consentErr ? (
            <p id={`${formId}-consent-error`} className="mt-1 text-sm text-danger">
              {consentErr.cause}
            </p>
          ) : null}
          {turnstileSiteKey ? (
            <TurnstileWidget
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              onToken={setTurnstileToken}
            />
          ) : null}
        </>
      )}

      {fieldErrors.length > 1 && (
        <div role="alert" className="space-y-1 text-sm text-danger">
          <p>Hay {fieldErrors.length} errores que revisar:</p>
          <ul className="list-disc pl-5">
            {fieldErrors.map((err) => (
              <li key={err.field}>
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-2"
                  onClick={() => {
                    setStepIndex(stepIndexForField(err.field));
                    focusField(err.field);
                  }}
                >
                  {err.label}: {err.cause}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'error' && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage} También puedes escribir a{' '}
          <a
            href="mailto:contratacion@alexendros.dev"
            className="underline decoration-dotted underline-offset-2"
          >
            contratacion@alexendros.dev
          </a>
          .
        </p>
      )}
      {status === 'rate_limited' && (
        <p role="alert" className="text-sm text-danger">
          Demasiados intentos. Espera un minuto e inténtalo de nuevo, o escribe a{' '}
          <a
            href="mailto:contratacion@alexendros.dev"
            className="underline decoration-dotted underline-offset-2"
          >
            contratacion@alexendros.dev
          </a>
          .
        </p>
      )}
      {status === 'unavailable' && (
        <p role="alert" className="text-sm text-danger">
          Servicio temporalmente no disponible. Escríbeme a{' '}
          <a
            href="mailto:contratacion@alexendros.dev"
            className="underline decoration-dotted underline-offset-2"
          >
            contratacion@alexendros.dev
          </a>
          .
        </p>
      )}
      {status === 'timeout' && (
        <p role="alert" className="text-sm text-danger">
          La respuesta tarda más de lo esperado. No sabemos si el mensaje llegó: espera un momento
          antes de reintentar o escribe a{' '}
          <a
            href="mailto:contratacion@alexendros.dev"
            className="underline decoration-dotted underline-offset-2"
          >
            contratacion@alexendros.dev
          </a>
          .
        </p>
      )}
      {sending ? (
        <p role="status" className="text-sm text-muted">
          Enviando tu petición…
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            disabled={sending}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            Atrás
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            disabled={sending || !hydrated}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            Continuar
          </button>
        )}
        {isLast && (
          <button
            type="submit"
            disabled={sending || !hydrated}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>
        )}
      </div>
    </form>
  );
}
