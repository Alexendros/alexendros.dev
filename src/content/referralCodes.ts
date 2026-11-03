/**
 * Lista cerrada de códigos de referido que pueden fijar cookie.
 * Hasta entonces solo los códigos aquí listados ponen cookie; el resto redirige
 * a /?origen=referido#contacto sin cookie.
 */
export const REFERRAL_ALLOWLIST = ['QA-ALLOWLIST'] as const;

const allowSet = new Set<string>(REFERRAL_ALLOWLIST);

export function isAllowedReferralCode(code: string): boolean {
  return allowSet.has(code);
}
