/**
 * Push opcional de alerta (compatible con ntfy: POST de texto plano).
 * Sin URL configurada (ALERT_WEBHOOK_URL) no hace nada. El texto nunca debe
 * llevar datos personales: solo un aviso genérico.
 */
export async function sendAlertWebhook(
  url: string | undefined,
  text: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 5000
): Promise<boolean> {
  const target = url?.trim();
  if (!target) return false;
  if (!/^https:\/\//i.test(target)) throw new Error('alert_webhook_not_https');
  const res = await fetchImpl(target, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8', Title: 'alexendros.dev' },
    body: text,
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error(`alert_webhook_http_${res.status}`);
  return true;
}
