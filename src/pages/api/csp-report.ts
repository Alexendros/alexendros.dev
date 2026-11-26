// Colector de violaciones CSP (Report-Only + Reporting-Endpoints).
// Siempre responde 204. Contadores Upstash y un correo al umbral (cspSignals).
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { clientIp } from '../../lib/contactHandler';
import { handleCspReportPost } from '../../lib/cspReportHandler';
import {
  CSP_SIGNAL_KEYS_SET,
  CSP_SIGNAL_WINDOW_SECONDS,
  type CspSignalAlert,
  createRedisCspSignalStore
} from '../../lib/cspSignals';
import { resolveSmtpConfig, smtpTransportOptions } from '../../lib/smtpConfig';

export const prerender = false;

/** From y To: buzón Proton autenticado (SMTP); no usar noreply@. */
const MAIL_FROM = 'operaciones@alexendros.dev';
const MAIL_TO = 'operaciones@alexendros.dev';

let cachedRatelimit: Ratelimit | null = null;
let cachedRedis: Redis | null = null;

function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

function getCspReportRatelimit(): Ratelimit | null {
  if (cachedRatelimit) return cachedRatelimit;
  const redis = getRedis();
  if (!redis) return null;
  cachedRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'alexendros:csp-report'
  });
  return cachedRatelimit;
}

async function sendCspAlert(alert: CspSignalAlert): Promise<void> {
  const smtp = resolveSmtpConfig({
    SMTP_HOST: import.meta.env.SMTP_HOST,
    SMTP_PORT: import.meta.env.SMTP_PORT,
    SMTP_USER: import.meta.env.SMTP_USER,
    SMTP_PASS: import.meta.env.SMTP_PASS
  });
  if (!smtp) return;

  const subject = `[alexendros.dev] CSP umbral ${alert.directive} (${alert.count})`;
  const text = [
    'Umbral de violaciones CSP cruzado.',
    `Directiva: ${alert.directive}`,
    `Origen: ${alert.origin}`,
    `Conteo (ventana ${CSP_SIGNAL_WINDOW_SECONDS}s): ${alert.count}`,
    `Registro de claves: ${CSP_SIGNAL_KEYS_SET}`
  ].join('\n');

  const transporter = nodemailer.createTransport(smtpTransportOptions(smtp));
  await transporter.sendMail({ from: MAIL_FROM, to: MAIL_TO, subject, text });
}

export const POST: APIRoute = async ({ request }) => {
  const limiter = getCspReportRatelimit();
  const redis = getRedis();
  return handleCspReportPost(request, undefined, {
    clientIp,
    rateLimit: limiter
      ? async (ip) => {
          const result = await limiter.limit(ip);
          return { success: result.success, reason: result.reason };
        }
      : undefined,
    signals: redis
      ? {
          store: createRedisCspSignalStore((script, keys, args) =>
            redis.eval<string[], [number, number]>(script, keys, args)
          ),
          sendAlert: sendCspAlert
        }
      : undefined
  });
};
