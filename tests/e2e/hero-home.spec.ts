import { test, expect } from '@playwright/test';

const H1 = 'Servicios informáticos y tecnológicos empresariales y profesionales.';
const TITLE = 'Alexendros — Tecnologías y servicios informáticos';
const DESCRIPTION =
  'Sitios web profesionales, integración de catálogo y pagos, auditoría técnica SEO y colaboración en proyectos de software. Desde Valencia.';

const LIST_ITEMS = [
  {
    label: 'Sitio web profesional',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Integración de catálogo y pagos',
    href: '/servicios?origen=home#portal-heading'
  },
  {
    label: 'Colaboración en proyectos de software',
    href: '/servicios/software-a-medida'
  },
  {
    label: 'Auditoría técnica SEO de un sitio existente',
    href: '/servicios/informe-comercial?origen=home'
  }
] as const;

const OLD_STRINGS = [
  'Webs y software a medida. Y revisión de la tuya.',
  'Tres caminos claros: una web o landing, un producto de software por fases, o una revisión con plan. Alcance acordado y trato directo.',
  'Cuéntame qué necesitas',
  'Explorar servicios',
  'Tecnología clara para negocios: auditoría, diseño y desarrollo',
  'Protocolos claros de gestión para empresas',
  'Ver servicios',
  'Servicios informáticos y tecnologías para empresas y particulares.'
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

  await expect(
    hero.getByRole('link', { name: 'Auditoría técnica SEO de un sitio existente →' })
  ).toHaveCount(0);

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
