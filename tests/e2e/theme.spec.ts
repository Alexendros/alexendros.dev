import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const palette = readFileSync(resolve(process.cwd(), 'src/styles/design-references.css'), 'utf8');
function paletteValue(property: string): string {
  const value = palette.match(new RegExp(`${property}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`Falta ${property} en la paleta Atlaps`);
  return value.replace(/(?<!\d)0\./g, '.');
}

const lightColor = paletteValue('--ds-atlaps-paper-bone');
const darkColor = paletteValue('--ds-atlaps-blueprint-deep');

test('el selector de tema actualiza data-theme y theme-color', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  const metas = page.locator('meta[name="theme-color"]');
  await expect(metas).toHaveCount(2);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexlight');
  await expect(metas.nth(0)).toHaveAttribute('content', lightColor);
  await expect(metas.nth(1)).toHaveAttribute('content', lightColor);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
  await expect(metas.nth(0)).toHaveAttribute('content', darkColor);
  await expect(metas.nth(1)).toHaveAttribute('content', darkColor);

  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', /.+/);
  await expect(metas.nth(0)).toHaveAttribute('content', lightColor);
  await expect(metas.nth(1)).toHaveAttribute('content', darkColor);
});

test('el tema guardado se aplica antes del paint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'alexdark');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  await expect(page.locator('meta[name="theme-color"]').nth(0)).toHaveAttribute(
    'content',
    darkColor
  );
});

test('el tema forzado aplica también las variables semánticas', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  await toggle.click();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  const darkBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  );
  expect(darkBg).toBe(darkColor);
  await toggle.click();
  const lightBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  );
  expect(lightBg).toBe(lightColor);
});
