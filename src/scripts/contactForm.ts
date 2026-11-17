import { normalizePortalModuleIds, serializePortalModuleIds } from '../content/portalModuleIds';
import { track } from '../lib/tracking/events';
import { validateContactClient } from '../lib/contactClientValidate';
import {
  contactOrigins,
  contactReasons,
  contactViaIds,
  portalModuleDisplayNames,
  resolveViaId,
  type ContactInput,
  type ContactViaId,
  type FieldError
} from '../lib/contactModel';
import { paquetesPublicados } from '../content/paquetes';

const SERVICE_SLUGS = new Set(['portal-web', 'software-a-medida']);
const PROJECT_SLUGS = new Set(['front-valencia', 'graficas-nasve', 'zedazo', 'alexendros-me']);

function normalizeServiceSlug(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed && SERVICE_SLUGS.has(trimmed) ? trimmed : undefined;
}

function normalizeProjectSlug(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed && PROJECT_SLUGS.has(trimmed) ? trimmed : undefined;
}

const SUBMIT_TIMEOUT_MS = 25_000;
const FIELD_IDS: Record<string, string> = {
  reason: 'contact-reason',
  name: 'contact-name',
  entityType: 'contact-entity',
  channel: 'contact-channel',
  email: 'contact-email',
  message: 'contact-message',
  consent: 'contact-consent',
  vias: paquetesPublicados ? 'contact-via-web' : 'contact-via-revisar',
  otraDetalle: 'contact-otra',
  sitio: 'contact-sitio'
};

/** IDs estáticos de aria-describedby por control (hint/count); el error se fusiona. */
const FIELD_STATIC_DESCRIBEDBY: Record<string, string[]> = {
  message: ['contact-message-hint', 'contact-message-error', 'contact-message-count'],
  name: ['contact-name-error'],
  email: ['contact-email-error'],
  sitio: ['contact-sitio-error'],
  otraDetalle: ['contact-otra-error']
};

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  name: 'Falta el nombre.',
  email: 'El correo no es válido. Ejemplo: nombre@empresa.es.',
  message: 'Falta el mensaje. Bastan una o dos frases sobre qué se necesita.',
  otraDetalle: 'Falta describir la otra necesidad.',
  sitio: 'El sitio no parece válido. Ejemplo: empresa.es.',
  consent: 'Hace falta aceptar el tratamiento de datos para poder responder.'
};

function setDescribedBy(field: string, control: HTMLElement, includeError: boolean): void {
  const ids = new Set<string>(FIELD_STATIC_DESCRIBEDBY[field] ?? []);
  if (includeError) ids.add(`${control.id}-error`);
  const value = [...ids].join(' ').trim();
  if (value) control.setAttribute('aria-describedby', value);
  else control.removeAttribute('aria-describedby');
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

function newEventId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `lead-${Date.now()}`;
}

function logicalPayloadKey(data: ContactInput): string {
  return JSON.stringify({
    name: data.name,
    entityType: data.entityType,
    channel: data.channel,
    email: data.email ?? null,
    reason: data.reason,
    message: data.message,
    vias: data.vias,
    otraDetalle: data.otraDetalle ?? null,
    sitio: data.sitio ?? null,
    modules: data.modules ?? null,
    serviceSlug: data.serviceSlug ?? null,
    projectSlug: data.projectSlug ?? null,
    origin: data.origin ?? null,
    consent: data.consent
  });
}

function collectVias(form: HTMLFormElement): ContactViaId[] {
  const boxes = form.querySelectorAll<HTMLInputElement>('input[name="via"]:checked');
  const out: ContactViaId[] = [];
  boxes.forEach((box) => {
    const id = box.value as ContactViaId;
    if ((contactViaIds as readonly string[]).includes(id) && !out.includes(id)) out.push(id);
  });
  return out;
}

function markVia(id: ContactViaId): void {
  if (!(contactViaIds as readonly string[]).includes(id)) return;
  const input = document.querySelector<HTMLInputElement>(`input[name="via"][value="${id}"]`);
  if (input) {
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function initContactForm(form: HTMLFormElement): void {
  if (form.dataset.contactInitialized === 'true') return;
  form.dataset.contactInitialized = 'true';

  const success = document.querySelector<HTMLElement>('[data-contact-success]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-contact-submit]')!;
  const emailWrapper = form.querySelector<HTMLElement>('[data-contact-email-wrapper]')!;
  const errorSummary = form.querySelector<HTMLElement>('[data-contact-errors]')!;
  const errorCount = form.querySelector<HTMLElement>('[data-contact-error-count]')!;
  const errorList = form.querySelector<HTMLElement>('[data-contact-error-list]')!;
  const modulesWrapper = form.querySelector<HTMLElement>('[data-contact-modules]');
  const moduleLabels = form.querySelector<HTMLElement>('[data-contact-module-labels]');
  const messageField = form.querySelector<HTMLTextAreaElement>('#contact-message');
  const messageCount = form.querySelector<HTMLElement>('[data-message-count]');
  const otraCheckbox = form.querySelector<HTMLInputElement>('#contact-via-otra');
  const otraField = form.querySelector<HTMLInputElement>('#contact-otra');
  const otraWrap = form.querySelector<HTMLElement>('[data-otra-wrap]');
  if (!success || !submit || !emailWrapper || !errorSummary || !errorCount || !errorList) {
    delete form.dataset.contactInitialized;
    return;
  }

  let inFlight = false;
  let idempotencyKey: string | null = null;
  let payloadKey: string | null = null;
  let successTracked = false;

  document.documentElement.dataset.contactHydrated = 'true';

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

  // Enlaces «/?origen=…#contacto» en la misma página: fijar el origen sin
  // recargar y bajar al formulario (sin JS, el enlace recarga y lo lee de la URL).
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href*="#contacto"]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.searchParams.has('origen')) return;
    event.preventDefault();
    const origin = originFromSearch(url.searchParams.get('origen'));
    if (origin) setHiddenValue('origin', origin);
    history.pushState(null, '', `${url.search}${url.hash}`);
    document.getElementById('contacto')?.scrollIntoView();
  });
  const modules =
    serializePortalModuleIds(normalizePortalModuleIds(params.get('modulos'))) ||
    formValue('modules');
  setHiddenValue('modules', modules);
  updateModuleLabels(modules);

  const viaParam = params.get('via');
  const viaId = viaParam ? resolveViaId(viaParam) : null;
  if (viaId) markVia(viaId);

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
    }
  }

  function updateMessageCount(): void {
    if (!messageField || !messageCount) return;
    messageCount.textContent = `${messageField.value.length} / ${messageField.maxLength > 0 ? messageField.maxLength : 1500}`;
  }

  function setSending(sending: boolean): void {
    form.setAttribute('aria-busy', String(sending));
    submit.disabled = sending;
    submit.textContent = sending ? 'Enviando…' : 'Solicitar propuesta';
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
      if (control) setDescribedBy(field, control, false);
      const error = document.getElementById(`${FIELD_IDS[field]}-error`);
      if (error) {
        error.hidden = true;
        error.textContent = '';
      }
    }
    const viasError = document.getElementById('contact-vias-error');
    if (viasError) {
      viasError.hidden = true;
      viasError.textContent = '';
    }
    errorSummary.hidden = true;
    errorCount.textContent = '';
    errorList.replaceChildren();
  }

  function showFieldErrors(errors: FieldError[]): void {
    clearFieldErrors();
    for (const error of errors) {
      if (error.field === 'vias') {
        const viasError = document.getElementById('contact-vias-error');
        if (viasError) {
          viasError.textContent = 'Marcar al menos una opción.';
          viasError.hidden = false;
        }
        continue;
      }
      const control = document.getElementById(FIELD_IDS[error.field] ?? `contact-${error.field}`);
      const errorElement = document.getElementById(
        `${FIELD_IDS[error.field] ?? `contact-${error.field}`}-error`
      );
      if (control) {
        control.setAttribute('aria-invalid', 'true');
        setDescribedBy(error.field, control, true);
      }
      if (errorElement) {
        errorElement.textContent = FIELD_ERROR_MESSAGES[error.field] ?? error.cause;
        errorElement.hidden = false;
      }
    }

    if (errors.length > 1) {
      errorCount.textContent = `Hay ${errors.length} errores que revisar:`;
      for (const error of errors) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'link';
        button.textContent = `${error.label}: ${error.cause}`;
        button.addEventListener('click', () => focusField(error.field));
        item.appendChild(button);
        errorList.appendChild(item);
      }
      errorSummary.hidden = false;
    }
    if (errors[0]) focusField(errors[0].field);
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
    const eventId = newEventId();
    const payload = {
      name: data.get('name'),
      entityType: data.get('entityType'),
      channel: data.get('channel'),
      email: data.get('email') || undefined,
      reason: data.get('reason'),
      message: data.get('message'),
      vias: collectVias(form),
      otraDetalle: data.get('otraDetalle') || undefined,
      sitio: data.get('sitio') || undefined,
      modules: data.get('modules') || undefined,
      serviceSlug: data.get('serviceSlug') || undefined,
      projectSlug: data.get('projectSlug') || undefined,
      origin: data.get('origin') || undefined,
      consent: data.get('consent') === 'on',
      honeypot: data.get('website'),
      eventId
    };
    const parsed = validateContactClient(payload);
    if (!parsed.success) {
      showFieldErrors(parsed.errors);
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
          track('contact_form_success', { eventId });
        }
      } else {
        showStatus('error');
      }
    } catch (error) {
      showStatus(
        error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'error'
      );
    } finally {
      window.clearTimeout(timer);
      inFlight = false;
      setSending(false);
    }
  }

  form.addEventListener('submit', submitForm);
  emailWrapper.hidden = false;
  messageField?.addEventListener('input', updateMessageCount);
  updateMessageCount();

  function setOtra(open: boolean): void {
    if (otraWrap) otraWrap.hidden = !open;
    otraCheckbox?.setAttribute('aria-expanded', String(open));
    if (!open && otraField) otraField.value = '';
  }

  setOtra(Boolean(otraCheckbox?.checked));
  otraCheckbox?.addEventListener('change', () => {
    const open = Boolean(otraCheckbox.checked);
    setOtra(open);
    if (open) otraField?.focus();
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-contact-form]')) {
  initContactForm(form);
}

document.querySelectorAll<HTMLAnchorElement>('[data-pick-via]').forEach((link) => {
  link.addEventListener('click', () => {
    const id = link.getAttribute('data-pick-via');
    if (id && (contactViaIds as readonly string[]).includes(id)) {
      markVia(id as ContactViaId);
    }
  });
});

export { markVia };
