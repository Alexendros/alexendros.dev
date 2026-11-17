import { describe, expect, it, vi } from 'vitest';
import {
  isAlertWebhookHostAllowed,
  parseAlertWebhookAllowedHosts,
  sendAlertWebhook
} from './alertWebhook';

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

  it('acepta subdominio de ntfy.sh', async () => {
    const f = vi.fn(async () => new Response('ok', { status: 200 }));
    await expect(
      sendAlertWebhook('https://eu.ntfy.sh/tema', 'hola', f as unknown as typeof fetch)
    ).resolves.toBe(true);
  });

  it('rechaza URL no https y errores HTTP', async () => {
    const f = vi.fn(async () => new Response('', { status: 500 }));
    await expect(
      sendAlertWebhook('http://ntfy.sh/x', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_not_https');
    await expect(
      sendAlertWebhook('https://ntfy.sh/t', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_http_500');
  });

  it('rechaza hosts fuera de la allowlist (SSRF / misconfig)', async () => {
    const f = vi.fn();
    await expect(
      sendAlertWebhook('https://localhost/hook', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_host_not_allowed');
    await expect(
      sendAlertWebhook('https://169.254.169.254/latest', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_host_not_allowed');
    await expect(
      sendAlertWebhook('https://evil.example.com/hook', 'a', f as unknown as typeof fetch)
    ).rejects.toThrow('alert_webhook_host_not_allowed');
    expect(f).not.toHaveBeenCalled();
  });

  it('respeta allowlist personalizada', async () => {
    const f = vi.fn(async () => new Response('ok', { status: 200 }));
    await expect(
      sendAlertWebhook('https://hooks.example.com/x', 'a', f as unknown as typeof fetch, 5000, [
        'hooks.example.com'
      ])
    ).resolves.toBe(true);
    await expect(
      sendAlertWebhook('https://ntfy.sh/x', 'a', f as unknown as typeof fetch, 5000, [
        'hooks.example.com'
      ])
    ).rejects.toThrow('alert_webhook_host_not_allowed');
  });
});

describe('parseAlertWebhookAllowedHosts / isAlertWebhookHostAllowed', () => {
  it('default a ntfy.sh', () => {
    expect(parseAlertWebhookAllowedHosts(undefined)).toEqual(['ntfy.sh']);
    expect(parseAlertWebhookAllowedHosts('')).toEqual(['ntfy.sh']);
  });

  it('parsea CSV', () => {
    expect(parseAlertWebhookAllowedHosts('Hooks.Example.com, ntfy.sh')).toEqual([
      'hooks.example.com',
      'ntfy.sh'
    ]);
  });

  it('match exacto o subdominio', () => {
    expect(isAlertWebhookHostAllowed('ntfy.sh')).toBe(true);
    expect(isAlertWebhookHostAllowed('eu.ntfy.sh')).toBe(true);
    expect(isAlertWebhookHostAllowed('notntfy.sh')).toBe(false);
  });
});
