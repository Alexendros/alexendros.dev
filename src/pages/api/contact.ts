import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  buildContactEmailHtml,
  CRM_FAILURE_SUBJECT_PREFIX,
  handleContactPost,
  methodNotAllowed,
  type ContactDeps,
  type ContactMailPayload
} from '../../lib/contactHandler';
import { sendAlertWebhook } from '../../lib/alertWebhook';
import { verifyTurnstileToken } from '../../lib/turnstile';
import { createRedisContactIdempotencyStore } from '../../lib/contactIdempotency';
import { createNotionLeadsStore } from '../../lib/notionLeads';

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
      UPSTASH_REDIS_REST_TOKEN: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
      TURNSTILE_SECRET_KEY: import.meta.env.TURNSTILE_SECRET_KEY
    }),
    rateLimit: async (ip) => {
      const result = await getContactRatelimit().limit(ip);
      return { success: result.success, reset: result.reset };
    },
    verifyTurnstile: async (token, ip) => {
      const secret = import.meta.env.TURNSTILE_SECRET_KEY;
      if (!secret) return false;
      return verifyTurnstileToken(secret, token, ip);
    },
    // Meta CAPI Lead no se emite desde el formulario: solo hay consentimiento
    // de respuesta, no de publicidad (CIERRE-21).
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
    saveLead: async ({ name, email, subject, message }) => {
      const token = import.meta.env.NOTION_TOKEN;
      const dataSourceId =
        import.meta.env.NOTION_LEADS_DATA_SOURCE_ID ?? import.meta.env.NOTION_LEADS_DATABASE_ID;
      if (!token || !dataSourceId) return;
      const store = createNotionLeadsStore(token, dataSourceId);
      await store.create({
        nombre: name,
        email,
        canal: 'Formulario',
        tipo: 'Lead contacto',
        estado: 'Nuevo',
        asunto: subject,
        mensaje: message,
        fuente: 'formulario',
        consentMarketing: false
      });
    },
    sendCrmFailureMail: async (payload) => sendContactMail(payload, CRM_FAILURE_SUBJECT_PREFIX),
    sendAlertWebhook: async (text) => {
      await sendAlertWebhook(import.meta.env.ALERT_WEBHOOK_URL, text);
    },
    sendMail: async (payload) => sendContactMail(payload)
  };
}

async function sendContactMail(
  { name, email, subject, message, replyTo, smtp }: ContactMailPayload,
  subjectPrefix?: string
): Promise<void> {
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
    subject: subjectPrefix ? `${subjectPrefix} ${mailSubject}` : mailSubject,
    html,
    text
  });
}

export const POST: APIRoute = async ({ request }) =>
  handleContactPost(request, createProductionDeps());

/** Métodos distintos de POST → 405 Allow: POST */
export const ALL: APIRoute = async () => methodNotAllowed();
