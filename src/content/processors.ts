/**
 * Registro único de encargados y orígenes de terceros activos.
 * Privacidad, cookies, banner y CSP se alimentan de aquí.
 */
import { CONTACT_RATE_LIMIT_PER_MINUTE } from '../lib/contactLimits';

export type ProcessorKind = 'hosting' | 'mail' | 'abuse-control' | 'analytics';

export type Processor = {
  id: string;
  name: string;
  kind: ProcessorKind;
  /** Texto para la lista de encargados en /privacidad. */
  privacySummary: string;
  /** Si exige consentimiento de analítica antes de cargar scripts. */
  requiresAnalyticsConsent: boolean;
  /** Orígenes CSP (sin comillas). */
  scriptSrc?: readonly string[];
  connectSrc?: readonly string[];
  imgSrc?: readonly string[];
};

export const PROCESSORS: readonly Processor[] = [
  {
    id: 'vercel-hosting',
    name: 'Vercel',
    kind: 'hosting',
    privacySummary:
      'Aloja el sitio estático y las funciones serverless del formulario (Estados Unidos / red global).',
    requiresAnalyticsConsent: false
  },
  {
    id: 'proton',
    name: 'Proton Mail',
    kind: 'mail',
    privacySummary:
      'Recibe el correo del formulario en operaciones@alexendros.dev (Suiza). No se usa como CRM.',
    requiresAnalyticsConsent: false
  },
  {
    id: 'upstash',
    name: 'Upstash',
    kind: 'abuse-control',
    privacySummary: `Limita el número de envíos para evitar abusos (${CONTACT_RATE_LIMIT_PER_MINUTE} por minuto) y guarda una huella calculada con SHA-256 del envío durante 10 minutos para no procesarlo dos veces. Datos en Frankfurt (UE). No guarda el contenido del mensaje.`,
    requiresAnalyticsConsent: false
  },
  {
    id: 'vercel-analytics',
    name: 'Vercel Analytics',
    kind: 'analytics',
    privacySummary:
      'Medición agregada de visitas (Web Analytics) solo tras consentimiento de analítica y solo en despliegues de Vercel. No usa cookies propias documentadas por la librería.',
    requiresAnalyticsConsent: true,
    scriptSrc: ['https://va.vercel-scripts.com'],
    connectSrc: ['https://va.vercel-scripts.com', 'https://vitals.vercel-insights.com']
  },
  {
    id: 'vercel-speed-insights',
    name: 'Vercel Speed Insights',
    kind: 'analytics',
    privacySummary:
      'Métricas de rendimiento (Core Web Vitals) solo tras consentimiento de analítica y solo en despliegues de Vercel.',
    requiresAnalyticsConsent: true,
    scriptSrc: ['https://va.vercel-scripts.com'],
    connectSrc: ['https://vitals.vercel-insights.com', 'https://va.vercel-scripts.com']
  }
] as const;

/** Encargados que aparecen en /privacidad (todos). */
export function privacyProcessors(): readonly Processor[] {
  return PROCESSORS;
}

/** Orígenes únicos para una directiva CSP. */
export function cspOrigins(field: 'scriptSrc' | 'connectSrc' | 'imgSrc'): readonly string[] {
  const set = new Set<string>();
  for (const p of PROCESSORS) {
    const list = p[field];
    if (!list) continue;
    for (const origin of list) set.add(origin);
  }
  return [...set].sort();
}

/** Hosts de terceros que el JS de producción puede nombrar. */
export function allowedThirdPartyHosts(): readonly string[] {
  const hosts = new Set<string>();
  for (const field of ['scriptSrc', 'connectSrc', 'imgSrc'] as const) {
    for (const origin of cspOrigins(field)) {
      try {
        hosts.add(new URL(origin).host);
      } catch {
        /* ignore */
      }
    }
  }
  return [...hosts].sort();
}
