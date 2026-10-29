import { normalizeProjectSlug, normalizeServiceSlug } from '../content/contactContext';
import { normalizePortalModuleIds, serializePortalModuleIds } from '../content/portalModules';
import { track } from '../lib/tracking/events';
import {
  contactOrigins,
  contactReasons,
  formatContactFieldErrors,
  parseContactBody,
  portalModuleDisplayNames,
  type ContactInput,
  type FieldError
} from '../lib/contactSchema';

const SUBMIT_TIMEOUT_MS = 25_000;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FIELD_IDS: Record<string, string> = {
  reason: 'contact-reason',
  name: 'contact-name',
  entityType: 'contact-entity',
  channel: 'contact-channel',
  phone: 'contact-phone',
  email: 'contact-email',
  message: 'contact-message',
  consent: 'contact-consent'
};

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function reasonFromSearch(value: string | null | undefined): ContactInput['reason'] {
  return value && (contactReasons as readonly string[]).includes(value)
    ? (value as ContactInput['reason'])
    : 'informacionCliente';
}

function originFromSearch(value: string | null | undefined): ContactInput['origin'] | '' {
  return value && (contactOrigins as readonly string[]).includes(value)
    ? (value as ContactInput['origin'])
    : '';
}

function newIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `contact-${Date.now()}`;
}

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

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('turnstile_load_failed')), {
        once: true
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('turnstile_load_failed')), {
      once: true
    });
    document.head.appendChild(script);
  });
}

function initContactForm(form: HTMLFormElement): void {
  if (form.dataset.contactInitialized === 'true') return;
  form.dataset.contactInitialized = 'true';

  const success = document.querySelector<HTMLElement>('[data-contact-success]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-contact-submit]')!;
  const phoneWrapper = form.querySelector<HTMLElement>('[data-contact-phone-wrapper]')!;
  const emailWrapper = form.querySelector<HTMLElement>('[data-contact-email-wrapper]')!;
  const errorSummary = form.querySelector<HTMLElement>('[data-contact-errors]')!;
  const errorCount = form.querySelector<HTMLElement>('[data-contact-error-count]')!;
  const errorList = form.querySelector<HTMLElement>('[data-contact-error-list]')!;
  const modulesWrapper = form.querySelector<HTMLElement>('[data-contact-modules]')!;
  const moduleLabels = form.querySelector<HTMLElement>('[data-contact-module-labels]')!;
  const turnstileContainer = form.querySelector<HTMLElement>('[data-turnstile]');
  if (
    !success ||
    !submit ||
    !phoneWrapper ||
    !emailWrapper ||
    !errorSummary ||
    !errorCount ||
    !errorList
  ) {
    delete form.dataset.contactInitialized;
    return;
  }

  let inFlight = false;
  let idempotencyKey: string | null = null;
  let payloadKey: string | null = null;
  let successTracked = false;
  let turnstileToken = '';
  let turnstileWidgetId: string | null = null;

  document.documentElement.dataset.contactHydrated = 'true';
  document.getElementById('contact-nojs')?.setAttribute('hidden', '');

  const params = new URLSearchParams(window.location.search);
  const initialReasonInput = form.elements.namedItem('reason');
  if (initialReasonInput instanceof HTMLInputElement) {
    initialReasonInput.value = reasonFromSearch(params.get('motivo') ?? initialReasonInput.value);
  }
  setHiddenValue(
    'serviceSlug',
    normalizeServiceSlug(params.get('servicio')) ??
      normalizeServiceSlug(formValue('serviceSlug')) ??
      ''
  );
  setHiddenValue(
    'projectSlug',
    normalizeProjectSlug(params.get('proyecto')) ??
      normalizeProjectSlug(formValue('projectSlug')) ??
      ''
  );
  setHiddenValue('origin', originFromSearch(params.get('origen') ?? formValue('origin')) ?? '');
  const modules =
    serializePortalModuleIds(normalizePortalModuleIds(params.get('modulos'))) ||
    formValue('modules');
  setHiddenValue('modules', modules);
  updateModuleLabels(modules);

  function formValue(name: string): string {
    const field = form.elements.namedItem(name);
    if (field instanceof RadioNodeList) return field.value;
    return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
      ? field.value
      : '';
  }

  function setHiddenValue(name: string, value: string): void {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement) field.value = value;
  }

  function updateModuleLabels(value: string): void {
    const labels = value ? portalModuleDisplayNames(value) : '';
    if (!labels) {
      if (modulesWrapper) modulesWrapper.hidden = true;
      return;
    }
    if (modulesWrapper && moduleLabels) {
      moduleLabels.textContent = labels;
      modulesWrapper.hidden = false;
      return;
    }
    const wrapper = document.createElement('p');
    wrapper.className = 'text-sm text-muted';
    wrapper.dataset.contactModules = '';
    wrapper.append('Módulos indicados: ');
    const strong = document.createElement('strong');
    strong.className = 'text-fg';
    strong.dataset.contactModuleLabels = '';
    strong.textContent = labels;
    wrapper.appendChild(strong);
    form.querySelector('h2')?.after(wrapper);
  }

  function updateChannel(): void {
    const channel = formValue('channel');
    phoneWrapper.hidden = channel !== 'whatsapp';
    emailWrapper.hidden = channel !== 'correo';
  }

  function setSending(sending: boolean): void {
    form.setAttribute('aria-busy', String(sending));
    submit.disabled = sending;
    submit.textContent = sending ? 'Enviando…' : 'Enviar';
    for (const element of form.querySelectorAll('input, textarea, button, fieldset')) {
      if (element !== submit) (element as HTMLInputElement).disabled = sending;
    }
    const loading = form.querySelector('[data-contact-status="loading"]');
    if (sending) showStatus('loading');
    else if (loading instanceof HTMLElement) loading.hidden = true;
  }

  function hideStatuses(): void {
    for (const status of form.querySelectorAll('[data-contact-status]')) {
      if (status instanceof HTMLElement) status.hidden = true;
    }
  }

  function showStatus(status: string): void {
    hideStatuses();
    const element = form.querySelector(`[data-contact-status="${status}"]`);
    if (element instanceof HTMLElement) element.hidden = false;
  }

  function focusField(field: string): void {
    requestAnimationFrame(() => {
      const element = document.getElementById(FIELD_IDS[field] ?? `contact-${field}`);
      if (element instanceof HTMLElement) element.focus();
      else document.getElementById('contact-form-heading')?.focus();
    });
  }

  function clearFieldErrors(): void {
    for (const field of Object.keys(FIELD_IDS)) {
      const control = document.getElementById(FIELD_IDS[field]!);
      control?.removeAttribute('aria-invalid');
      control?.removeAttribute('aria-describedby');
      const error = document.getElementById(`${FIELD_IDS[field]}-error`);
      if (error) {
        error.hidden = true;
        error.textContent = '';
      }
    }
    errorSummary.hidden = true;
    errorCount.textContent = '';
    errorList.replaceChildren();
  }

  function showFieldErrors(errors: FieldError[]): void {
    clearFieldErrors();
    for (const error of errors) {
      const control = document.getElementById(FIELD_IDS[error.field] ?? `contact-${error.field}`);
      const errorElement = document.getElementById(
        `${FIELD_IDS[error.field] ?? `contact-${error.field}`}-error`
      );
      if (control) {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', `${control.id}-error`);
      }
      if (errorElement) {
        errorElement.textContent = error.cause;
        errorElement.hidden = false;
      }
    }

    if (errors.length > 1) {
      errorCount.textContent = `Hay ${errors.length} errores que revisar:`;
      for (const error of errors) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'underline decoration-dotted underline-offset-2';
        button.textContent = `${error.label}: ${error.cause}`;
        button.addEventListener('click', () => focusField(error.field));
        item.appendChild(button);
        errorList.appendChild(item);
      }
      errorSummary.hidden = false;
    }
    if (errors[0]) focusField(errors[0].field);
  }

  function resetTurnstile(): void {
    turnstileToken = '';
    if (turnstileWidgetId && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId);
      } catch {
        /* noop */
      }
    }
  }

  function resolveIdempotencyKey(data: ContactInput): string {
    const logical = logicalPayloadKey(data);
    if (idempotencyKey && payloadKey === logical) return idempotencyKey;
    idempotencyKey = newIdempotencyKey();
    payloadKey = logical;
    return idempotencyKey;
  }

  async function submitForm(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (inFlight) return;

    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      entityType: data.get('entityType'),
      channel: data.get('channel'),
      phone: data.get('phone') || undefined,
      email: data.get('email') || undefined,
      reason: data.get('reason'),
      message: data.get('message'),
      modules: data.get('modules') || undefined,
      serviceSlug: data.get('serviceSlug') || undefined,
      projectSlug: data.get('projectSlug') || undefined,
      origin: data.get('origin') || undefined,
      consent: data.get('consent') === 'on',
      honeypot: data.get('website'),
      turnstileToken: turnstileToken || undefined
    };
    const parsed = parseContactBody(payload);
    if (!parsed.success) {
      showFieldErrors(formatContactFieldErrors(parsed.error));
      return;
    }

    clearFieldErrors();
    inFlight = true;
    setSending(true);
    track('form_submit');

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    const key = resolveIdempotencyKey(parsed.data);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify(parsed.data),
        signal: controller.signal
      });
      let body: { ok?: boolean; status?: string; error?: string; replay?: boolean } = {};
      try {
        body = (await response.json()) as typeof body;
      } catch {
        body = {};
      }

      if (response.status === 429) showStatus('rate_limited');
      else if (response.status === 202 || body.status === 'processing') showStatus('processing');
      else if (response.status === 409 || body.status === 'conflict') showStatus('conflict');
      else if (response.status === 503)
        showStatus(body.status === 'unknown' ? 'unknown' : 'unavailable');
      else if (response.status === 200 && body.status === 'accepted') {
        hideStatuses();
        form.hidden = true;
        success.textContent = success.dataset.successMessage ?? '';
        success.hidden = false;
        success.focus();
        if (body.replay !== true && !successTracked) {
          successTracked = true;
          track('contact_form_success');
        }
      } else {
        showStatus('error');
      }
      resetTurnstile();
    } catch (error) {
      showStatus(
        error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'error'
      );
      resetTurnstile();
    } finally {
      window.clearTimeout(timer);
      inFlight = false;
      setSending(false);
    }
  }

  form.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === 'channel')
      updateChannel();
  });
  form.addEventListener('submit', submitForm);
  updateChannel();

  if (turnstileContainer) {
    const siteKey = turnstileContainer.dataset.siteKey;
    if (siteKey) {
      void loadTurnstileScript()
        .then(() => {
          if (!window.turnstile) return;
          turnstileWidgetId = window.turnstile.render(turnstileContainer, {
            sitekey: siteKey,
            callback: (token: string) => {
              turnstileToken = token;
            },
            'expired-callback': () => {
              turnstileToken = '';
            },
            'error-callback': () => {
              turnstileToken = '';
            }
          });
        })
        .catch(() => {
          turnstileToken = '';
        });
    }
  }
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-contact-form]')) {
  initContactForm(form);
}
