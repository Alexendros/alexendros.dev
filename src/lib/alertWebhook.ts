/**
 * Push opcional de alerta (compatible con ntfy: POST de texto plano).
 * Sin URL configurada (ALERT_WEBHOOK_URL) no hace nada. El texto nunca debe
 * llevar datos personales: solo un aviso genérico.
 *
 * Destino restringido a HTTPS + hostname allowlisted (default ntfy.sh) para
 * mitigar SSRF por misconfiguración de ALERT_WEBHOOK_URL (OWASP A10).
 */

export const DEFAULT_ALERT_WEBHOOK_HOSTS = ['ntfy.sh'] as const;

/** Parsea `ALERT_WEBHOOK_ALLOWED_HOSTS` (CSV). Vacío → default ntfy.sh. */
export function parseAlertWebhookAllowedHosts(raw?: string): string[] {
  if (!raw?.trim()) return [...DEFAULT_ALERT_WEBHOOK_HOSTS];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAlertWebhookHostAllowed(
  hostname: string,
  allowedHosts: readonly string[] = DEFAULT_ALERT_WEBHOOK_HOSTS
): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  return allowedHosts.some((allowed) => {
    const a = allowed.trim().toLowerCase();
    return a.length > 0 && (host === a || host.endsWith(`.${a}`));
  });
}

export async function sendAlertWebhook(
  url: string | undefined,
  text: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 5000,
  allowedHosts: readonly string[] = DEFAULT_ALERT_WEBHOOK_HOSTS
): Promise<boolean> {
  const target = url?.trim();
  if (!target) return false;
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new Error('alert_webhook_invalid_url');
  }
  if (parsed.protocol !== 'https:') throw new Error('alert_webhook_not_https');
  if (!isAlertWebhookHostAllowed(parsed.hostname, allowedHosts)) {
    throw new Error('alert_webhook_host_not_allowed');
  }
  const res = await fetchImpl(target, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8', Title: 'alexendros.dev' },
    body: text,
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error(`alert_webhook_http_${res.status}`);
  return true;
}
