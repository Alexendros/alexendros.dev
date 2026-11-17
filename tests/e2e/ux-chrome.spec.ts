import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    try {
      localStorage.removeItem('theme');
      localStorage.removeItem('consent_v1');
    } catch {
      /* private mode */
    }
  });
  await page.emulateMedia({ colorScheme: 'light' });
});

async function dismissConsentIfPresent(page: import('@playwright/test').Page) {
  const banner = page.locator('#cc-main .cm');
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
    await expect(banner).toBeHidden({ timeout: 10_000 });
  }
}

test('menú hamburguesa abre y cierra el desplegable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('html[data-header-ready="true"]')).toBeAttached();
  await dismissConsentIfPresent(page);

  const open = page.getByRole('button', { name: 'Abrir menú' });
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  const nav = page.locator('#mobile-nav');
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Servicios' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  await expect(nav).toBeHidden();
});

test('toggle de tema cambia data-theme y el fondo de forma visible', async ({ page }) => {
  await page.goto('/');
  await dismissConsentIfPresent(page);
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
  await expect(html).toHaveClass(/cc--darkmode/);

  const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', /.+/);
  const systemBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(darkBg).not.toBe(systemBg);
});

test('vías del formulario tienen icono y checkbox con marca visible', async ({ page }) => {
  await page.goto('/contacto/');
  await dismissConsentIfPresent(page);
  const ways = page.locator('#contact-ways');
  await expect(ways.locator('legend')).toContainText(/Por dónde empezar/i);
  const first = ways.locator('label').first();
  await expect(first.locator('svg').first()).toBeVisible();
  const checkbox = first.locator('input[type="checkbox"]');
  await expect(checkbox).toBeVisible();
  const before = await checkbox.evaluate((el) => getComputedStyle(el).backgroundImage);
  await first.click();
  await expect(checkbox).toBeChecked();
  const after = await checkbox.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(after).not.toBe('none');
  expect(after).not.toBe(before);
});

test('Configurar abre el panel de cookies legible', async ({ page }) => {
  await page.goto('/cookies/');
  await expect(page.locator('html[data-cmp-ready="true"]')).toBeAttached({ timeout: 30_000 });
  const trigger = page.locator('main').getByRole('button', { name: 'Configurar' });
  await trigger.click();
  const panel = page.locator('#cc-main .pm');
  await expect(panel).toBeVisible({ timeout: 10_000 });
  await expect(panel.getByRole('heading', { name: 'Elige qué se activa' })).toBeVisible();

  const contrast = await panel.evaluate((el) => {
    const section = el.querySelector('.pm__section--toggle') ?? el.querySelector('.pm__section');
    if (!section) return null;
    const cs = getComputedStyle(section);
    const title = section.querySelector('.pm__section-title');
    const titleCs = title ? getComputedStyle(title) : null;
    return {
      bg: cs.backgroundColor,
      color: titleCs?.color ?? cs.color,
      opacity: getComputedStyle(el).opacity,
      visibility: getComputedStyle(el).visibility
    };
  });
  expect(contrast).not.toBeNull();
  expect(contrast!.opacity).toBe('1');
  expect(contrast!.visibility).toBe('visible');
  expect(contrast!.bg).not.toBe(contrast!.color);

  await panel.getByRole('button', { name: 'Cerrar panel de cookies' }).click();
  await expect(panel).toBeHidden();
});
