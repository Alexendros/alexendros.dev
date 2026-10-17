import type { BrowserContext, Page, Route } from '@playwright/test';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

const ANALYTICS_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'clarity.ms',
  'i.posthog.com',
  'posthog.com'
] as const;

const MARKETING_HOSTS = ['facebook.net', 'facebook.com', 'licdn.com', 'linkedin.com'] as const;

export type SeenRequest = {
  method: string;
  hostname: string;
  pathname: string;
  /** URL redactada (sin query ni hash). */
  redactedUrl: string;
};

export type SafeNetworkState = {
  seen: SeenRequest[];
  unexpectedMutations: SeenRequest[];
  contactPosts: Array<{ idempotencyKey: string; body: string }>;
};

function matchesHost(hostname: string, domains: readonly string[]): boolean {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function isTrackerHost(hostname: string): boolean {
  return matchesHost(hostname, ANALYTICS_HOSTS) || matchesHost(hostname, MARKETING_HOSTS);
}

export function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname);
}

function redactUrl(raw: string): string {
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`;
  } catch {
    return '[invalid-url]';
  }
}

function isMutating(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

export type ContactRouteHandler = (route: Route) => Promise<void> | void;

/**
 * Interceptación a nivel de contexto (cubre páginas nuevas).
 * - Deniega orígenes no locales salvo stubs de trackers y /_vercel.
 * - Intercepta POST /api/contact.
 * - Cualquier otra mutación no prevista se aborta y se registra.
 */
export async function installSafeNetwork(
  context: BrowserContext,
  options: {
    contactHandler?: ContactRouteHandler;
    /** Si true, permite GET al origen local (preview). */
    allowLocalGet?: boolean;
  } = {}
): Promise<SafeNetworkState> {
  const state: SafeNetworkState = {
    seen: [],
    unexpectedMutations: [],
    contactPosts: []
  };

  const defaultContact: ContactRouteHandler = async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        status: 'accepted',
        requestId: 'e2e-safe',
        replay: false
      })
    });
  };

  const contactHandler = options.contactHandler ?? defaultContact;

  await context.route('**/*', async (route) => {
    const request = route.request();
    const method = request.method().toUpperCase();
    let url: URL;
    try {
      url = new URL(request.url());
    } catch {
      state.unexpectedMutations.push({
        method,
        hostname: '',
        pathname: '',
        redactedUrl: '[invalid-url]'
      });
      await route.abort('failed');
      return;
    }

    const entry: SeenRequest = {
      method,
      hostname: url.hostname,
      pathname: url.pathname,
      redactedUrl: redactUrl(request.url())
    };
    state.seen.push(entry);

    // Trackers: stub JS vacío (intención de red visible; no SDK real).
    if (isTrackerHost(url.hostname)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '/* e2e-safe-network */'
      });
      return;
    }

    // Plataforma Vercel (P2): stub sin servicio real.
    if (url.pathname.startsWith('/_vercel')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '/* e2e-vercel-stub */'
      });
      return;
    }

    // Contacto: único POST mutante autorizado del preview.
    if (url.pathname === '/api/contact') {
      if (method !== 'POST') {
        await route.fulfill({
          status: 405,
          headers: { Allow: 'POST', 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' })
        });
        return;
      }
      state.contactPosts.push({
        idempotencyKey: request.headers()['idempotency-key'] ?? '',
        body: request.postData() ?? ''
      });
      await contactHandler(route);
      return;
    }

    // Mutaciones no previstas → abortar y registrar (el test debe fallar si hay alguna).
    if (isMutating(method) && isLocalHost(url.hostname)) {
      state.unexpectedMutations.push(entry);
      await route.abort('failed');
      return;
    }

    // Orígenes externos no autorizados (excepto trackers ya stubbed).
    if (!isLocalHost(url.hostname)) {
      state.unexpectedMutations.push(entry);
      await route.abort('failed');
      return;
    }

    await route.continue();
  });

  return state;
}

/** Falla el test si hubo mutaciones o destinos no autorizados. */
export function assertNoUnexpectedEgress(state: SafeNetworkState): void {
  if (state.unexpectedMutations.length === 0) return;
  const sample = state.unexpectedMutations
    .slice(0, 5)
    .map((r) => `${r.method} ${r.redactedUrl}`)
    .join('; ');
  throw new Error(`Egress no autorizado (${state.unexpectedMutations.length}): ${sample}`);
}

/**
 * Control positivo del banco: un POST deliberado a ruta no prevista debe
 * abortarse. No deja regresión en producción; solo prueba el aislamiento.
 */
export async function probeUnauthorizedMutation(page: Page): Promise<'aborted' | 'completed'> {
  return page.evaluate(async () => {
    try {
      await fetch('/api/e2e-unauthorized-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      return 'completed';
    } catch {
      return 'aborted';
    }
  });
}

export { ANALYTICS_HOSTS, MARKETING_HOSTS, LOCAL_HOSTS };
