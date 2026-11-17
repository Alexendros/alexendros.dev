/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly PUBLIC_COOKIE_CONSENT_VERSION?: string;
  readonly VERCEL_GIT_COMMIT_SHA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Inyectado por vite.define en astro.config.mjs: true solo en builds de Vercel. */
declare const __IS_VERCEL__: boolean;
