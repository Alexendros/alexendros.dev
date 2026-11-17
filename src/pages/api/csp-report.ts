// Fase ② PROTECCIÓN — colector de violaciones CSP (modo observación).
// Recibe los informes de report-uri mientras la política endurecida corre en
// Report-Only. La agregación queda para la fase ③.
import type { APIRoute } from 'astro';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { handleCspReportPost } from '../../lib/cspReportHandler';
import { clientIp } from '../../lib/contactHandler';

export const prerender = false;

let cachedRatelimit: Ratelimit | null = null;

function getCspReportRatelimit(): Ratelimit | null {
  if (cachedRatelimit) return cachedRatelimit;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'alexendros:csp-report'
  });
  return cachedRatelimit;
}

export const POST: APIRoute = async ({ request }) => {
  const limiter = getCspReportRatelimit();
  return handleCspReportPost(request, undefined, {
    clientIp,
    rateLimit: limiter
      ? async (ip) => {
          const result = await limiter.limit(ip);
          return { success: result.success };
        }
      : undefined
  });
};
