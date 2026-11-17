// Cabecera CSP Report-Only en rutas on-demand (prerender = false).
// Las páginas estáticas reciben la misma política vía vercel.json.
import { defineMiddleware } from 'astro:middleware';
import { buildCsp, CSP_REPORT_URI } from './lib/csp';

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    res.headers.set(
      'Content-Security-Policy-Report-Only',
      buildCsp({ withHashes: true, reportUri: CSP_REPORT_URI })
    );
  }
  return res;
});
