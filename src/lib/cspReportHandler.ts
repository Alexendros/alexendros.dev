/** Colector CSP Report-Only: límite de cuerpo y logging acotado (OWASP A09). */

export const MAX_CSP_REPORT_BYTES = 16 * 1024;

export type CspReportLog = (label: string, detail?: string) => void;

/**
 * Lee el cuerpo del informe CSP con tope de bytes. Siempre responde 204;
 * no propaga el cuerpo si es oversized o no-JSON.
 */
export async function handleCspReportPost(
  request: Request,
  log: CspReportLog = (label, detail) => {
    if (detail !== undefined) console.warn(label, detail);
    else console.warn(label);
  }
): Promise<Response> {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > MAX_CSP_REPORT_BYTES) {
      log('[csp-report]', `oversized_content_length:${n}`);
      return new Response(null, { status: 204 });
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return new Response(null, { status: 204 });
  }

  if (raw.length > MAX_CSP_REPORT_BYTES) {
    log('[csp-report]', `oversized_body:${raw.length}`);
    return new Response(null, { status: 204 });
  }

  if (!raw.trim()) {
    return new Response(null, { status: 204 });
  }

  try {
    const report: unknown = JSON.parse(raw);
    log('[csp-report]', JSON.stringify(report));
  } catch {
    // cuerpos no-JSON: ignorar
  }

  return new Response(null, { status: 204 });
}
