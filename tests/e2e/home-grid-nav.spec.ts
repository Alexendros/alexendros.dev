import { test, expect } from '@playwright/test';

test('F01: home muestra las cuatro secciones y Más información', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Servicios', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Referencias', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Metodología', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Valores', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Más información' }).first()).toBeVisible();
  await expect(page.getByText('Cuéntame')).toHaveCount(0);
  await expect(page.locator('#lead-magnet')).toHaveCount(0);
});

test('navegación móvil abre/cierra con teclado y gestiona el foco', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const menuButton = page.locator('[data-menu-button]');
  const mobileNav = page.locator('[data-mobile-nav]');
  await expect(menuButton).toBeVisible();
  await expect(mobileNav).toBeHidden();

  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.locator('a').first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(mobileNav).toBeHidden();
  await expect(menuButton).toBeFocused();
});
