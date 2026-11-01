import { describe, expect, it, vi } from 'vitest';
import { sendAlertWebhook } from './alertWebhook';

describe('sendAlertWebhook', () => {
  it('sin URL no hace nada', async () => {
    const f = vi.fn();
    expect(await sendAlertWebhook(undefined, 'x', f as unknown as typeof fetch)).toBe(false);
    expect(await sendAlertWebhook('  ', 'x', f as unknown as typeof fetch)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it('POST de texto plano a la URL (ntfy)', async () => {
    const f = vi.fn(async () => new Response('ok', { status: 200 }));
    const ok = await sendAlertWebhook('https://ntfy.sh/tema', 'hola', f as unknown as typeof fetch);
    expect(ok).toBe(true);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://ntfy.sh/tema');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('hola');
    expect((init.headers as Record<string, string>)['Content-Type']).toMatch(/^text\/plain/);
  });

  it('rechaza URL no https y errores HTTP', async () => {
    const f = vi.fn(async () => new Response('', { status: 500 }));
    await expect(sendAlertWebhook('http://x', 'a', f as unknown as typeof fetch)).rejects.toThrow();
    await expect(
      sendAlertWebhook('https://ntfy.sh/t', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_http_500');
  });
});
