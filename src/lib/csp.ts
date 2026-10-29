// SSOT de la Content-Security-Policy de alexendros.dev.
// Fase ② PROTECCIÓN · Protocolo Trifásico.
// Alimenta la cabecera Report-Only de vercel.json y el middleware de rutas
// on-demand. La CSP de enforce en vercel.json permanece intacta hasta la fase ③.

export type CspDirectiveMap = Record<string, string[]>;

/** Allowlists de terceros portadas desde la CSP de enforce (fase ①). */
export const CSP_DIRECTIVES: CspDirectiveMap = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    'https://va.vercel-scripts.com',
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
    'https://www.clarity.ms',
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    'https://snap.licdn.com',
    'https://challenges.cloudflare.com'
  ],
  'style-src': [
    "'self'",
    // 'unsafe-inline' no entra en la política endurecida: Astro externaliza
    // estilos (build.inlineStylesheets: 'never'). El inline de terceros se
    // decide en fase ③, tras observar /api/csp-report.
    'https://www.googletagmanager.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://www.facebook.com',
    'https://c.clarity.ms',
    'https://eu.i.posthog.com',
    'https://px.ads.linkedin.com',
    'https://challenges.cloudflare.com'
  ],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://vitals.vercel-insights.com',
    'https://va.vercel-scripts.com',
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://metrics.alexendros.dev',
    'https://connect.facebook.net',
    'https://www.facebook.com',
    'https://graph.facebook.com',
    'https://www.clarity.ms',
    'https://c.clarity.ms',
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    'https://snap.licdn.com',
    'https://px.ads.linkedin.com',
    'https://challenges.cloudflare.com'
  ],
  'frame-src': [
    'https://www.googletagmanager.com',
    'https://td.doubleclick.net',
    'https://challenges.cloudflare.com'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"]
};

/**
 * Hashes sha256 de scripts inline conocidos.
 * Fase ③ los rellena con scripts/inject-csp-hashes.mjs. En esta base van vacíos:
 * el enforce de script-src no cambia; solo se observa la política endurecida.
 */
export const INLINE_SCRIPT_HASHES: string[] = [];

export interface BuildCspOptions {
  /** nonce por petición (solo rutas on-demand). */
  nonce?: string;
  /** añade INLINE_SCRIPT_HASHES a script-src. */
  withHashes?: boolean;
  /** endpoint colector de violaciones. */
  reportUri?: string;
}

/** Construye la cadena CSP endurecida a partir del SSOT. */
export function buildCsp(opts: BuildCspOptions = {}): string {
  const d: CspDirectiveMap = JSON.parse(JSON.stringify(CSP_DIRECTIVES)) as CspDirectiveMap;
  if (opts.nonce) {
    d['script-src'].push(`'nonce-${opts.nonce}'`);
    d['style-src'].push(`'nonce-${opts.nonce}'`);
  }
  if (opts.withHashes && INLINE_SCRIPT_HASHES.length > 0) {
    d['script-src'].push(...INLINE_SCRIPT_HASHES);
  }
  const body = Object.entries(d)
    .map(([k, v]) => `${k} ${v.join(' ')}`.trim())
    .join('; ');
  return opts.reportUri ? `${body}; report-uri ${opts.reportUri}; report-to csp-endpoint` : body;
}
