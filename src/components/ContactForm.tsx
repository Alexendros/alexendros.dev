import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  contactProjectOptions,
  contactServiceOptions,
  normalizeProjectSlug,
  normalizeServiceSlug
} from '../content/contactContext';
import { normalizePortalModuleIds, serializePortalModuleIds } from '../content/pricing';
import { track } from '../lib/tracking/events';
import {
  contactChannels,
  contactOrigins,
  contactReasons,
  entityLabels,
  entityTypes,
  formatContactFieldErrors,
  parseContactBody,
  portalModuleDisplayNames,
  reasonLabels,
  type ContactInput,
  type FieldError
} from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
  /** Valores iniciales desde la URL (SSR); evita HTML con motivo por defecto. */
  initialReason?: ContactInput['reason'];
  initialOrigin?: ContactInput['origin'] | '';
  initialServiceSlug?: string;
  initialProjectSlug?: string;
  initialModules?: string;
};

const SUBMIT_TIMEOUT_MS = 25_000;

/** Mapa campo Zod → id del control real (entityType → contact-entity). */
const CONTROL_ID_BY_FIELD: Record<string, string> = {
  reason: 'contact-reason',
  name: 'contact-name',
  entityType: 'contact-entity',
  channel: 'contact-channel',
  phone: 'contact-phone',
  email: 'contact-email',
  message: 'contact-message',
  consent: 'contact-consent'
};

const inputClass =
  'focus-ring mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus:outline-none';

function reasonFromSearch(value: string | null | undefined): ContactInput['reason'] {
  if (value && (contactReasons as readonly string[]).includes(value)) {
    return value as ContactInput['reason'];
  }
  return 'informacionCliente';
}

function originFromSearch(value: string | null | undefined): ContactInput['origin'] | '' {
  if (value && (contactOrigins as readonly string[]).includes(value)) {
    return value as ContactInput['origin'];
  }
  return '';
}

function errorFor(field: string, errors: FieldError[]): FieldError | undefined {
  return errors.find((e) => e.field === field);
}

/** Identidad lógica del envío (sin Turnstile). */
function logicalPayloadKey(data: ContactInput): string {
  return JSON.stringify({
    name: data.name,
    entityType: data.entityType,
    channel: data.channel,
    phone: data.phone ?? null,
    email: data.email ?? null,
    reason: data.reason,
    message: data.message,
    modules: data.modules ?? null,
    serviceSlug: data.serviceSlug ?? null,
    projectSlug: data.projectSlug ?? null,
    origin: data.origin ?? null,
    consent: data.consent
  });
}

function newIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `contact-${Date.now()}`;
}

export default function ContactForm({
  successMessage,
  errorMessage,
  turnstileSiteKey,
  initialReason,
  initialOrigin,
  initialServiceSlug,
  initialProjectSlug,
  initialModules
}: Props) {
  const formId = useId();
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const inFlightRef = useRef(false);
  const pendingFocusRef = useRef<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const payloadKeyRef = useRef<string | null>(null);
  const [status, setStatus] = useState<
    | 'idle'
    | 'ok'
    | 'error'
    | 'rate_limited'
    | 'unavailable'
    | 'loading'
    | 'timeout'
    | 'processing'
    | 'conflict'
    | 'unknown'
  >('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [form, setForm] = useState({
    name: '',
    entityType: 'particular' as ContactInput['entityType'],
    channel: 'correo' as ContactInput['channel'],
    phone: '',
    email: '',
    reason: reasonFromSearch(initialReason),
    message: '',
    modules: initialModules ?? '',
    serviceSlug: initialServiceSlug ?? '',
    projectSlug: initialProjectSlug ?? '',
    origin: (initialOrigin ?? '') as ContactInput['origin'] | '',
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [focusTick, setFocusTick] = useState(0);
  const successTrackedRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-contact-hydrated', 'true');
    document.getElementById('contact-nojs')?.setAttribute('hidden', '');
    const params = new URLSearchParams(window.location.search);
    const reason = reasonFromSearch(params.get('motivo') ?? initialReason);
    const modules =
      serializePortalModuleIds(normalizePortalModuleIds(params.get('modulos'))) ||
      initialModules ||
      '';
    const serviceSlug =
      normalizeServiceSlug(params.get('servicio')) ??
      normalizeServiceSlug(initialServiceSlug) ??
      '';
    const projectSlug =
      normalizeProjectSlug(params.get('proyecto')) ??
      normalizeProjectSlug(initialProjectSlug) ??
      '';
    const origin = originFromSearch(params.get('origen') ?? initialOrigin);
    setForm((prev) => ({
      ...prev,
      reason,
      modules,
      serviceSlug,
      projectSlug,
      origin
    }));
    return () => {
      document.documentElement.removeAttribute('data-contact-hydrated');
    };
  }, [initialReason, initialOrigin, initialServiceSlug, initialProjectSlug, initialModules]);

  const moduleLabels = useMemo(
    () => portalModuleDisplayNames(form.modules || undefined),
    [form.modules]
  );

  const sending = status === 'loading';

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const queueFocus = (target: string) => {
    pendingFocusRef.current = target;
    setFocusTick((t) => t + 1);
  };

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    requestAnimationFrame(() => {
      if (target === 'form') {
        formHeadingRef.current?.focus();
        return;
      }
      if (target === 'success') {
        successRef.current?.focus();
        return;
      }
      const id = CONTROL_ID_BY_FIELD[target] ?? `contact-${target}`;
      const el = document.getElementById(id);
      if (el instanceof HTMLElement) {
        el.focus();
        return;
      }
      formHeadingRef.current?.focus();
    });
  }, [fieldErrors, status, focusTick]);

  useEffect(() => {
    if (status === 'ok') {
      pendingFocusRef.current = 'success';
      setFocusTick((t) => t + 1);
    }
  }, [status]);

  const fieldDescribedBy = (field: string, err?: FieldError) => {
    if (!err) return undefined;
    return `${formId}-${field}-error`;
  };

  const resolveIdempotencyKey = (data: ContactInput): string => {
    const logical = logicalPayloadKey(data);
    if (idempotencyKeyRef.current && payloadKeyRef.current === logical) {
      return idempotencyKeyRef.current;
    }
    const key = newIdempotencyKey();
    idempotencyKeyRef.current = key;
    payloadKeyRef.current = logical;
    return key;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || sending) return;

    const payload = {
      name: form.name,
      entityType: form.entityType,
      channel: form.channel,
      phone: form.phone || undefined,
      email: form.email || undefined,
      reason: form.reason,
      message: form.message,
      modules: form.modules || undefined,
      serviceSlug: form.serviceSlug || undefined,
      projectSlug: form.projectSlug || undefined,
      origin: form.origin || undefined,
      consent: form.consent as true,
      honeypot: form.honeypot,
      turnstileToken: turnstileToken || undefined
    };
    const parsed = parseContactBody(payload);
    if (!parsed.success) {
      const errors = formatContactFieldErrors(parsed.error);
      setFieldErrors(errors);
      if (errors[0]) queueFocus(errors[0].field);
      return;
    }
    setFieldErrors([]);
    inFlightRef.current = true;
    setStatus('loading');
    track('form_submit');

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    const idempotencyKey = resolveIdempotencyKey(parsed.data);

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

      let body: { ok?: boolean; status?: string; error?: string; replay?: boolean } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        body = {};
      }

      if (res.status === 429) {
        setStatus('rate_limited');
        resetTurnstile();
        return;
      }
      if (res.status === 202 || body.status === 'processing') {
        setStatus('processing');
        resetTurnstile();
        return;
      }
      if (res.status === 409 || body.status === 'conflict') {
        setStatus('conflict');
        resetTurnstile();
        return;
      }
      if (res.status === 503) {
        if (body.status === 'unknown') {
          setStatus('unknown');
        } else {
          setStatus('unavailable');
        }
        resetTurnstile();
        return;
      }
      if (res.status === 200 && body.status === 'accepted') {
        setStatus('ok');
        if (body.replay !== true && !successTrackedRef.current) {
          successTrackedRef.current = true;
          track('contact_form_success');
        }
        return;
      }
      if (!res.ok) {
        setStatus('error');
        resetTurnstile();
        return;
      }
      setStatus('error');
      resetTurnstile();
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
        className="focus-ring rounded-lg border border-primarySoft bg-primaryGhost p-4 text-sm focus:outline-none"
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

  return (
    <form onSubmit={submit} className="relative space-y-4" noValidate aria-busy={sending}>
      <h2
        id={`${formId}-heading`}
        ref={formHeadingRef}
        tabIndex={-1}
        className="focus-ring text-base font-bold focus:outline-none"
      >
        Tu petición
      </h2>

      <div className="honeypot" aria-hidden="true">
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
      {form.origin ? <input type="hidden" name="origin" value={form.origin} /> : null}

      {moduleLabels ? (
        <p className="text-sm text-muted" data-contact-modules>
          Módulos indicados: <strong className="text-fg">{moduleLabels}</strong>
        </p>
      ) : null}

      <div>
        <label htmlFor="contact-reason" className="text-sm">
          Motivo*
        </label>
        <select
          id="contact-reason"
          name="reason"
          className={inputClass}
          value={form.reason}
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
          <p id={`${formId}-reason-error`} role="alert" className="mt-1 text-sm text-danger">
            {reasonErr.cause}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm">
          Mensaje*
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          className={inputClass}
          value={form.message}
          aria-required="true"
          aria-invalid={messageErr ? true : undefined}
          aria-describedby={fieldDescribedBy('message', messageErr)}
          disabled={sending}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Describe qué necesitas o qué quieres preguntar."
        />
        {messageErr ? (
          <p id={`${formId}-message-error`} role="alert" className="mt-1 text-sm text-danger">
            {messageErr.cause}
          </p>
        ) : null}
      </div>

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
          aria-required="true"
          aria-invalid={nameErr ? true : undefined}
          aria-describedby={fieldDescribedBy('name', nameErr)}
          disabled={sending}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {nameErr ? (
          <p id={`${formId}-name-error`} role="alert" className="mt-1 text-sm text-danger">
            {nameErr.cause}
          </p>
        ) : null}
      </div>

      <fieldset
        id="contact-channel"
        disabled={sending}
        aria-invalid={channelErr ? true : undefined}
        aria-describedby={fieldDescribedBy('channel', channelErr)}
        tabIndex={-1}
        className="focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <legend className="text-sm">Preferencia de respuesta*</legend>
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
          <p id={`${formId}-channel-error`} role="alert" className="mt-1 text-sm text-danger">
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
            <p id={`${formId}-phone-error`} role="alert" className="mt-1 text-sm text-danger">
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
            <p id={`${formId}-email-error`} role="alert" className="mt-1 text-sm text-danger">
              {emailErr.cause}
            </p>
          ) : null}
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-sm">
        <p className="text-xs text-muted">
          Opcional. Puedes dejarlo vacío; no altera precio ni condiciones.
        </p>
        <div>
          <label htmlFor="contact-entity" className="text-sm">
            Categoría
          </label>
          <select
            id="contact-entity"
            name="entityType"
            className={inputClass}
            value={form.entityType}
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
            <p id={`${formId}-entityType-error`} role="alert" className="mt-1 text-sm text-danger">
              {entityErr.cause}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-service" className="text-sm">
            Servicio de referencia
          </label>
          <select
            id="contact-service"
            name="serviceSlug"
            className={inputClass}
            value={form.serviceSlug}
            disabled={sending}
            data-contact-service
            onChange={(e) => setForm((f) => ({ ...f, serviceSlug: e.target.value }))}
          >
            <option value="">Ninguno</option>
            {contactServiceOptions.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-project" className="text-sm">
            Trabajo de referencia
          </label>
          <select
            id="contact-project"
            name="projectSlug"
            className={inputClass}
            value={form.projectSlug}
            disabled={sending}
            data-contact-project
            onChange={(e) => setForm((f) => ({ ...f, projectSlug: e.target.value }))}
          >
            <option value="">Ninguno</option>
            {contactProjectOptions.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        <p id={`${formId}-consent-error`} role="alert" className="mt-1 text-sm text-danger">
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

      {fieldErrors.length > 1 && (
        <div role="alert" className="space-y-1 text-sm text-danger">
          <p>Hay {fieldErrors.length} errores que revisar:</p>
          <ul className="list-disc pl-5">
            {fieldErrors.map((err) => (
              <li key={err.field}>
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-2"
                  onClick={() => queueFocus(err.field)}
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
      {status === 'processing' && (
        <p role="status" className="text-sm text-muted">
          Tu petición se está procesando. Espera unos segundos antes de reintentar; no confirmamos
          aún la recepción.
        </p>
      )}
      {status === 'conflict' && (
        <p role="alert" className="text-sm text-danger">
          Esta petición no coincide con un envío anterior. Revisa los datos o escribe a{' '}
          <a
            href="mailto:contratacion@alexendros.dev"
            className="underline decoration-dotted underline-offset-2"
          >
            contratacion@alexendros.dev
          </a>
          .
        </p>
      )}
      {status === 'unknown' && (
        <p role="alert" className="text-sm text-danger">
          No podemos confirmar si el mensaje llegó. No reenvíes de inmediato; espera un momento o
          escribe a{' '}
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

      <button
        type="submit"
        disabled={sending}
        className="btn focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover disabled:opacity-60"
      >
        {sending ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  );
}
