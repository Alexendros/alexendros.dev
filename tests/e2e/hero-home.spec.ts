import { test, expect } from '@playwright/test';

const H1 = 'Servicios informáticos y tecnologías para empresas y particulares.';
const TITLE = 'Alexendros — Tecnologías y servicios informáticos';
const DESCRIPTION =
  'Sitios web profesionales, integración de catálogo y pagos, aplicaciones para Linux e integración de Inteligencia Artificial. Desde Valencia.';

const LIST_ITEMS = [
  {
    label: 'Página web para profesionales y emprendedores',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Integración de catálogo y pagos',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Aplicaciones útiles para ordenadores con Linux',
    href: '/contacto?motivo=propuestaComercial&origen=home-linux'
  },
  {
    label: 'Integración de Inteligencia Artificial en procesos empresariales y oficios',
    href: '/contacto?motivo=propuestaComercial&origen=home-ia'
  }
] as const;

const OLD_STRINGS = [
  'Webs y software a medida. Y revisión de la tuya.',
  'Tres caminos claros: una web o landing, un producto de software por fases, o una revisión con plan. Alcance acordado y trato directo.',
  'Cuéntame qué necesitas',
  'Explorar servicios',
  'Tecnología clara para negocios: auditoría, diseño y desarrollo',
  'Protocolos claros de gestión para empresas',
  'Ver servicios'
] as const;

test('Hero home: copy, enlaces, metadatos y sin cadenas antiguas', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-hero]');
  await expect(hero.getByRole('heading', { level: 1, name: H1 })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);

  const items = hero.locator('ul > li');
  await expect(items).toHaveCount(4);
  for (let i = 0; i < LIST_ITEMS.length; i++) {
    const link = items.nth(i).getByRole('link');
    // Link arrow: el → está aria-hidden; el nombre accesible es la etiqueta.
    await expect(link).toHaveAccessibleName(LIST_ITEMS[i].label);
    await expect(link).toHaveAttribute('href', LIST_ITEMS[i].href);
    await expect(items.nth(i)).toHaveClass(/border-t/);
  }

  const revisionLabel = 'Revisión técnica de páginas web existentes →';
  const revision = hero.getByRole('link', { name: revisionLabel });
  await expect(revision).toBeVisible();
  await expect(revision).toHaveAttribute('href', '/servicios/informe-comercial?origen=home');

  await expect(hero.getByRole('link', { name: 'Solicitar propuesta' })).toHaveAttribute(
    'href',
    '/contacto?motivo=propuestaComercial&origen=home'
  );
  await expect(hero.getByRole('link', { name: 'Catálogo de servicios' })).toHaveAttribute(
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
