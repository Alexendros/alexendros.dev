// Fase ② PROTECCIÓN — colector de violaciones CSP (modo observación).
// Recibe los informes de report-uri mientras la política endurecida corre en
// Report-Only. La agregación queda para la fase ③.
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const report: unknown = await request.json();
    console.warn('[csp-report]', JSON.stringify(report));
  } catch {
    // cuerpos no-JSON: ignorar
  }
  return new Response(null, { status: 204 });
};
