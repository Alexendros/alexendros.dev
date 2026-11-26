/**
 * Lee el cuerpo con tope de bytes. Cancela el stream al superar el límite.
 * Distingue los errores de lectura del exceso de tamaño.
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<{ ok: true; text: string } | { ok: false; reason: 'too_large' | 'read_error' }> {
  const body = request.body;
  if (!body) {
    return { ok: true, text: '' };
  }
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: 'too_large' };
      }
      chunks.push(value);
    }
  } catch {
    await reader.cancel().catch(() => {});
    return { ok: false, reason: 'read_error' };
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder('utf-8').decode(merged) };
}
