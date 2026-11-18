// SSOT de la Content-Security-Policy de alexendros.dev.
// Orígenes de terceros desde src/content/processors.ts.
import { createHash } from 'node:crypto';
import { cspOrigins } from '../content/processors';
import { LAYER_ORDER_STYLE, THEME_INIT_SOURCE } from './cspInline';

export { LAYER_ORDER_STYLE, THEME_INIT_SOURCE } from './cspInline';

export const CSP_REPORT_URI = '/api/csp-report/';

export type CspDirectiveMap = Record<string, string[]>;

function sha256Csp(content: string): string {
  return `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

/** Hashes de scripts inline conocidos (tema). */
export function inlineScriptHashes(): string[] {
  return [sha256Csp(THEME_INIT_SOURCE)];
}

/** Hashes de estilos inline conocidos (@layer). */
export function inlineStyleHashes(): string[] {
  return [sha256Csp(LAYER_ORDER_STYLE)];
}

/** Allowlists mínimas: self + Vercel Analytics / Speed Insights. */
export function buildCspDirectives(): CspDirectiveMap {
  const scriptExtra = cspOrigins('scriptSrc');
  const connectExtra = cspOrigins('connectSrc');
  const imgExtra = cspOrigins('imgSrc');
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...scriptExtra],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'blob:', ...imgExtra],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...connectExtra],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"]
  };
}

/** Snapshot para tests que importan el objeto estático. */
export const CSP_DIRECTIVES: CspDirectiveMap = buildCspDirectives();

/** @deprecated Prefer inlineScriptHashes(). */
export const INLINE_SCRIPT_HASHES: string[] = [];

export interface BuildCspOptions {
  withHashes?: boolean;
  reportUri?: string;
}

/** Construye la cadena CSP endurecida a partir del SSOT. */
export function buildCsp(opts: BuildCspOptions = {}): string {
  const d: CspDirectiveMap = JSON.parse(JSON.stringify(buildCspDirectives())) as CspDirectiveMap;
  if (opts.withHashes) {
    d['script-src'].push(...inlineScriptHashes());
    d['style-src'].push(...inlineStyleHashes());
  }
  const body = Object.entries(d)
    .map(([k, v]) => `${k} ${v.join(' ')}`.trim())
    .join('; ');
  return opts.reportUri ? `${body}; report-uri ${opts.reportUri}; report-to csp-endpoint` : body;
}
