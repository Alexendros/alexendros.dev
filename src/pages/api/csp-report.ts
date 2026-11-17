// Fase ② PROTECCIÓN — colector de violaciones CSP (modo observación).
// Recibe los informes de report-uri mientras la política endurecida corre en
// Report-Only. La agregación queda para la fase ③.
import type { APIRoute } from 'astro';
import { handleCspReportPost } from '../../lib/cspReportHandler';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => handleCspReportPost(request);
