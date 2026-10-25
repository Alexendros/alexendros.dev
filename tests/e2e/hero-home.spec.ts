import { test, expect } from '@playwright/test';
import { formatEuro, provisionalPrices } from '../../src/content/pricing';

const H1 = 'Tecnología clara para negocios: auditoría, diseño y desarrollo';
const TITLE = 'Alexendros — Auditoría, diseño y desarrollo web';
const DESCRIPTION =
  'Página web, tienda en internet, aplicaciones para Linux, protocolos de gestión e integración de Inteligencia Artificial. Desde Valencia.';

const LIST_ITEMS = [
  {
    label: 'Página web para profesionales y emprendedores',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Tienda en internet con catálogo y cobro seguro',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Aplicaciones útiles para ordenadores con Linux',
    href: '/contacto?motivo=propuestaComercial&origen=home-linux'
  },
  {
    label: 'Protocolos claros de gestión para empresas',
    href: '/contacto?motivo=propuestaComercial&origen=home-gestion'
  },
  {
    label: 'Integración de Inteligencia Artificial en procesos y trabajos',
    href: '/contacto?motivo=propuestaComercial&origen=home-ia'
  }
] as const;

const OLD_STRINGS = [
  'Webs y software a medida. Y revisión de la tuya.',
  'Tres caminos claros: una web o landing, un producto de software por fases, o una revisión con plan. Alcance acordado y trato directo.',
  'Cuéntame qué necesitas',
  'Explorar servicios'
] as const;

test('Hero home: copy, enlaces, metadatos y sin cadenas antiguas', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-hero]');
  await expect(hero.getByRole('heading', { level: 1, name: H1 })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);

  const items = hero.locator('ul > li');
  await expect(items).toHaveCount(5);
  for (let i = 0; i < LIST_ITEMS.length; i++) {
    const link = items.nth(i).getByRole('link');
    await expect(link).toHaveText(LIST_ITEMS[i].label);
    await expect(link).toHaveAttribute('href', LIST_ITEMS[i].href);
  }

  const revisionLabel = `Revisión de páginas web existentes, desde ${formatEuro(provisionalPrices.informeComercial)} + IVA →`;
  const revision = hero.getByRole('link', { name: revisionLabel });
  await expect(revision).toBeVisible();
  await expect(revision).toHaveAttribute('href', '/servicios/informe-comercial?origen=home');

  await expect(hero.getByRole('link', { name: 'Solicitar propuesta' })).toHaveAttribute(
    'href',
    '/contacto?motivo=propuestaComercial&origen=home'
  );
  await expect(hero.getByRole('link', { name: 'Ver servicios' })).toHaveAttribute(
    'href',
    '/servicios?origen=home'
  );

  await expect(page).toHaveTitle(TITLE);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', DESCRIPTION);

  const bodyText = await page.locator('body').innerText();
  for (const old of OLD_STRINGS) {
    expect(bodyText, `cadena antigua presente: ${old}`).not.toContain(old);
  }
});
