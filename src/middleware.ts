// Fase ② PROTECCIÓN — nonce CSP para rutas on-demand.
// Con output: 'static' las páginas prerenderizadas no pasan por este middleware;
// su cabecera Report-Only la fija vercel.json. Aquí solo se cubre prerender = false.
import { defineMiddleware } from 'astro:middleware';
import { buildCsp } from './lib/csp';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  ctx.locals.cspNonce = nonce;

  const res = await next();
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    res.headers.set(
      'Content-Security-Policy-Report-Only',
      buildCsp({ nonce, reportUri: '/api/csp-report' })
    );
  }
  return res;
});
