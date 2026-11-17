import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  buildContactEmailHtml,
  handleContactPost,
  methodNotAllowed,
  type ContactDeps,
  type ContactMailPayload
} from '../../lib/contactHandler';
import { createRedisContactIdempotencyStore } from '../../lib/contactIdempotency';
import { isCapiConfigured, sendCapiEvent } from '../../lib/tracking/capi';

export const prerender = false;

const MAIL_FROM = 'operaciones@alexendros.dev';
const MAIL_TO = 'operaciones@alexendros.dev';

let cachedRatelimit: Ratelimit | null = null;
let cachedRedis: Redis | null = null;

function getContactRedis(): Redis {
  if (cachedRedis) return cachedRedis;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis_misconfigured');
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

function getContactRatelimit(): Ratelimit {
  if (cachedRatelimit) return cachedRatelimit;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis_misconfigured');
  cachedRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'alexendros:contact'
  });
  return cachedRatelimit;
}

function createProductionDeps(): ContactDeps {
  return {
    getEnv: () => ({
      SMTP_HOST: import.meta.env.SMTP_HOST,
      SMTP_PORT: import.meta.env.SMTP_PORT,
      SMTP_USER: import.meta.env.SMTP_USER,
      SMTP_PASS: import.meta.env.SMTP_PASS,
      UPSTASH_REDIS_REST_URL: import.meta.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: import.meta.env.UPSTASH_REDIS_REST_TOKEN
    }),
    rateLimit: async (ip) => {
      const result = await getContactRatelimit().limit(ip);
      return { success: result.success, reset: result.reset };
    },
    idempotencyStore: createRedisContactIdempotencyStore({
      get: async (key) => getContactRedis().get(key),
      set: async (key, value, opts) => {
        const redis = getContactRedis();
        if (opts.nx) {
          return redis.set(key, value, { nx: true, ex: opts.ex });
        }
        return redis.set(key, value, { ex: opts.ex });
      }
    }),
    sendLeadEvent: async ({ email, ip, userAgent, sourceUrl, eventId, fbp, fbc }) => {
      const pixelId =
        (import.meta.env.META_PIXEL_ID as string | undefined)?.trim() ||
        (import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined)?.trim();
      const accessToken = (import.meta.env.META_CAPI_TOKEN as string | undefined)?.trim();
      const cfg = {
        pixelId,
        accessToken,
        testEventCode: (import.meta.env.META_CAPI_TEST_EVENT_CODE as string | undefined)?.trim()
      };
      if (!isCapiConfigured(cfg)) return;
      await sendCapiEvent(cfg, {
        eventName: 'Lead',
        eventSourceUrl: sourceUrl ?? undefined,
        eventId,
        userData: { email, ip, userAgent: userAgent ?? undefined, fbp, fbc }
      });
    },
    sendMail: async (payload) => sendContactMail(payload)
  };
}

async function sendContactMail({
  name,
  email,
  subject,
  message,
  replyTo,
  smtp
}: ContactMailPayload): Promise<void> {
  const { html, text, mailSubject } = buildContactEmailHtml({
    name,
    email,
    subject,
    message
  });
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass }
  });
  await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    ...(replyTo ? { replyTo } : {}),
    subject: mailSubject,
    html,
    text
  });
}

export const POST: APIRoute = async ({ request }) =>
  handleContactPost(request, createProductionDeps());

/** Métodos distintos de POST → 405 Allow: POST */
export const ALL: APIRoute = async () => methodNotAllowed();
