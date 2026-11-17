import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const VIEWPORT_MOBILE = { width: 390, height: 844 } as const;
export const VIEWPORT_DESKTOP = { width: 1280, height: 800 } as const;

/** Neutraliza webdriver y limpia tema/consentimiento antes de la primera navegación. */
export async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    try {
      localStorage.removeItem('theme');
      localStorage.removeItem('consent_v1');
    } catch {
      /* private mode */
    }
  });
}

/** Cierra el banner CMP si está visible (rechazo de opcionales). */
export async function dismissConsent(page: Page): Promise<void> {
  const banner = page.locator('#cc-main .cm');
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
    await expect(banner).toBeHidden({ timeout: 10_000 });
  }
}

export async function waitForCmpReady(page: Page): Promise<void> {
  await expect(page.locator('html[data-cmp-ready="true"]')).toBeAttached({ timeout: 30_000 });
}

export async function waitForHeaderReady(page: Page): Promise<void> {
  await expect(page.locator('html[data-header-ready="true"]')).toBeAttached({ timeout: 15_000 });
}

/** axe WCAG: cero violaciones o fallo con detalle. */
export async function axeZero(page: Page, label: string): Promise<void> {
  const results = await // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new AxeBuilder({ page: page as any }).analyze();
  expect(results.violations, `${label}: ${JSON.stringify(results.violations, null, 2)}`).toEqual(
    []
  );
}

/** Navega, espera chrome listo y cierra CMP si hace falta. */
export async function gotoReady(
  page: Page,
  path: string,
  opts?: { dismissCmp?: boolean }
): Promise<void> {
  await page.goto(path);
  await waitForHeaderReady(page);
  if (opts?.dismissCmp !== false) {
    await dismissConsent(page);
  }
}
