import { test, expect } from '@playwright/test';
import {
  VIEWPORT_MOBILE,
  VIEWPORT_DESKTOP,
  clearStorage,
  dismissConsent,
  waitForCmpReady,
  waitForHeaderReady,
  axeZero,
  gotoReady
} from './helpers/interactive';

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

test.describe('chrome — skip, menú, tema, CTA', () => {
  test('skip link lleva al contenido principal', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.goto('/');
    await waitForHeaderReady(page);
    await dismissConsent(page);

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /Saltar al contenido/i });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main, main#contenido, main').first()).toBeInViewport();
  });

  test('menú móvil: abrir, navegar cada enlace y Escape', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await gotoReady(page, '/');

    const open = page.getByRole('button', { name: 'Abrir menú' });
    await open.click();
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    const nav = page.locator('#mobile-nav');
    await expect(nav).toBeVisible();
    await axeZero(page, 'menú móvil abierto');

    const labels = ['Servicios', 'Referencias', 'Metodología'] as const;
    for (const label of labels) {
      await page.setViewportSize(VIEWPORT_MOBILE);
      await gotoReady(page, '/');
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      await page.locator('#mobile-nav').getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(
        new RegExp(`/${label === 'Metodología' ? 'metodologia' : label.toLowerCase()}/?`, 'i')
      );
      await expect(page.locator('#mobile-nav')).toBeHidden();
      await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    }

    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('tema cicla según nextThemeMode con flip visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    // Con light: system → alexdark → system
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await gotoReady(page, '/');
    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: /^Tema:/ });

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'alexdark');
    await expect(html).toHaveClass(/cc--darkmode/);
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await toggle.click();
    await expect(html).not.toHaveAttribute('data-theme', /.+/);
    const systemBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(systemBg).not.toBe(darkBg);

    // Con dark: system → alexlight → alexdark → system
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.evaluate(() => {
      try {
        localStorage.removeItem('theme');
      } catch {
        /* private mode */
      }
    });
    await page.reload();
    await waitForHeaderReady(page);
    await dismissConsent(page);
    const toggle2 = page.getByRole('button', { name: /^Tema:/ });
    await toggle2.click();
    await expect(html).toHaveAttribute('data-theme', 'alexlight');
    await expect(html).not.toHaveClass(/cc--darkmode/);
    await toggle2.click();
    await expect(html).toHaveAttribute('data-theme', 'alexdark');
    await toggle2.click();
    await expect(html).not.toHaveAttribute('data-theme', /.+/);
  });

  test('CTA Contacto de cabecera lleva a propuesta comercial', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/');
    await page.getByRole('banner').getByRole('link', { name: 'Contacto', exact: true }).click();
    await expect(page).toHaveURL(/\/contacto\/?\?motivo=propuestaComercial/);
  });
});

test.describe('pie — enlaces internos y externos', () => {
  test('enlaces del pie: internos 200, mailto/externos con href válido', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/');
    const footer = page.getByRole('contentinfo');
    const hrefs = await footer
      .locator('a[href]')
      .evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? '')
      );

    expect(hrefs.length).toBeGreaterThan(0);
    const origin = new URL(page.url()).origin;

    for (const href of hrefs) {
      if (/^mailto:/i.test(href)) {
        expect(href).toMatch(/^mailto:[^\s]+@.+/i);
        continue;
      }
      if (/^https?:\/\//i.test(href)) {
        const url = new URL(href);
        expect(url.protocol).toMatch(/^https?:$/);
        expect(url.hostname.length).toBeGreaterThan(0);
        continue;
      }
      const absolute = new URL(href, origin);
      const res = await page.request.get(absolute.pathname + absolute.search);
      expect(res.status(), `pie → ${href}`).toBeLessThan(400);
    }
  });
});

test.describe('CMP — banner y preferencias', () => {
  test('banner en home: rechazar, aceptar y reabrir preferencias', async ({ page, context }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.goto('/');
    await waitForCmpReady(page);
    const banner = page.locator('#cc-main .cm');
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
    await expect(banner).toBeHidden({ timeout: 10_000 });

    // Reset CMP (localStorage + cookies del consent) y aceptar
    await context.clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* private mode */
      }
    });
    await page.goto('/');
    await waitForCmpReady(page);
    await expect(banner).toBeVisible({ timeout: 10_000 });
    await banner.getByRole('button', { name: 'Aceptar todas' }).click();
    await expect(banner).toBeHidden({ timeout: 10_000 });

    await page.goto('/cookies/');
    await waitForCmpReady(page);
    await page.locator('main').getByRole('button', { name: 'Configurar' }).click();
    const panel = page.locator('#cc-main .pm');
    await expect(panel).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByRole('heading', { name: /Elige qué se activa/i })).toBeVisible();
    await axeZero(page, 'CMP preferencias tras aceptar');
    await panel.getByRole('button', { name: /Cerrar panel/i }).click();
    await expect(panel).toBeHidden();
  });

  test('preferencias CMP en tema oscuro sin violaciones axe', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.addInitScript(() => {
      try {
        localStorage.setItem('theme', 'alexdark');
      } catch {
        /* private mode */
      }
    });
    await page.goto('/cookies/');
    await waitForCmpReady(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
    await page.locator('main').getByRole('button', { name: 'Configurar' }).click();
    const panel = page.locator('#cc-main .pm');
    await expect(panel).toBeVisible({ timeout: 10_000 });
    await axeZero(page, 'CMP preferencias alexdark');
  });
});

test.describe('home — FAQ y CTAs', () => {
  test('FAQ: abrir cada ítem, contenido visible y exclusividad name=faq', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/');
    const items = page.locator('#faq details.faq-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i += 1) {
      const item = items.nth(i);
      await item.locator('summary').click();
      await expect(item).toHaveAttribute('open', '');
      await expect(item.locator('p').first()).toBeVisible();
      // exclusividad accordion HTML
      for (let j = 0; j < count; j += 1) {
        if (j === i) continue;
        await expect(items.nth(j)).not.toHaveAttribute('open', '');
      }
    }
    await items.first().locator('summary').click();
    await expect(items.first()).toHaveAttribute('open', '');
    await axeZero(page, 'FAQ abierto');
  });

  test('CTAs del hero navegan a destinos internos', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/');
    const hero = page.locator('main').locator('section').first();
    const ctas = hero.getByRole('link');
    const n = await ctas.count();
    expect(n).toBeGreaterThanOrEqual(1);
    const href = await ctas.first().getAttribute('href');
    expect(href).toBeTruthy();
    await ctas.first().click();
    const target = new URL(href!, page.url());
    await expect(page).toHaveURL((url) => {
      return (
        url.pathname.replace(/\/$/, '') === target.pathname.replace(/\/$/, '') &&
        url.search === target.search
      );
    });
  });
});

test.describe('referencias — filtros y soft-nav', () => {
  test('filtros aria-pressed y grid', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/referencias/');
    const group = page.getByRole('group', { name: 'Filtrar referencias por tipo' });
    const buttons = group.getByRole('button');
    const n = await buttons.count();
    expect(n).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < n; i += 1) {
      const btn = buttons.nth(i);
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      for (let j = 0; j < n; j += 1) {
        if (j === i) continue;
        await expect(buttons.nth(j)).toHaveAttribute('aria-pressed', 'false');
      }
    }
  });

  test('soft-nav: abrir, Escape, cerrar, history.back y axe', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/referencias/');
    const card = page.locator('main a[href^="/referencias/"]').first();
    await card.click();
    const dialog = page.locator('dialog[data-detail-island][open]');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/referencias\/.+/);
    await axeZero(page, 'detail-island abierto');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/referencias\/?$/);

    await card.click();
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-detail-close]').click();
    await expect(dialog).toBeHidden();

    await card.click();
    await expect(dialog).toBeVisible();
    await page.goBack();
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });

  test('ficha slug: details técnicos y CTA', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/referencias/front-valencia/');
    const details = page.locator('main details').first();
    if (await details.count()) {
      await details.locator('summary').click();
      await expect(details).toHaveAttribute('open', '');
    }
    const cta = page
      .locator('main')
      .getByRole('link')
      .filter({ hasText: /contacto|propuesta|solicitar/i })
      .first();
    if (await cta.count()) {
      await expect(cta).toBeVisible();
    }
  });
});

test.describe('servicios — cards, details, CTA', () => {
  test('cada ServiceCard navega al slug', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/servicios/');
    const cards = page.locator('main a[href^="/servicios/"]');
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(1);
    const hrefs = await cards.evaluateAll((els) =>
      [...new Set(els.map((el) => (el as HTMLAnchorElement).pathname))].filter(
        (p) => p !== '/servicios/' && p !== '/servicios'
      )
    );
    for (const path of hrefs) {
      const res = await page.request.get(path.endsWith('/') ? path : `${path}/`);
      expect(res.status(), path).toBe(200);
    }
    await cards.first().click();
    await expect(page).toHaveURL(/\/servicios\/[^/]+\/?/);
  });

  test('ficha servicio: details técnicos y CTA principal', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/servicios/software-a-medida/');
    const details = page.locator('main details');
    if ((await details.count()) > 0) {
      await details.first().locator('summary').click();
      await expect(details.first()).toHaveAttribute('open', '');
    }
    await expect(
      page.locator('main').getByRole('link', { name: /Solicitar propuesta/i })
    ).toBeVisible();
  });

  test('CTA propuesta del índice', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/servicios/');
    const cta = page
      .locator('main')
      .getByRole('link', { name: /Solicitar propuesta/i })
      .first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/contacto\/?/);
  });
});

test.describe('contacto — vías, validación, contador', () => {
  test('seleccionar ≥2 vías con icono y marca; validación vacía; contador', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/contacto/');
    const ways = page.locator('#contact-ways');
    const labels = ways
      .locator('label')
      .filter({ has: page.locator('input[type="checkbox"][name="via"]') });
    const n = await labels.count();
    expect(n).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < 2; i += 1) {
      const label = labels.nth(i);
      await expect(label.locator('svg').first()).toBeVisible();
      const checkbox = label.locator('input[type="checkbox"]');
      await label.click();
      await expect(checkbox).toBeChecked();
      const bg = await checkbox.evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg).not.toBe('none');
    }

    const message = page.locator('#contact-message');
    await message.fill('Hola auditoría');
    await expect(page.locator('[data-message-count]')).toContainText(/1[0-9] \/ 1500/);

    await page.locator('#contact-name').fill('');
    await page.getByRole('button', { name: /Enviar|Solicitar propuesta/i }).click();
    await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible({ timeout: 5_000 });
    await axeZero(page, 'contacto con errores de validación');
  });
});

test.describe('rutas secundarias — CTAs principales', () => {
  test('/metodologia CTA Enviar solicitud', async ({ page }) => {
    await gotoReady(page, '/metodologia/');
    const cta = page.locator('main').getByRole('link', { name: /Enviar solicitud/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/contacto\/?/);
  });

  test('/experiencia enlaces y CTA', async ({ page }) => {
    await gotoReady(page, '/experiencia/');
    await expect(
      page.locator('main a[href*="github.com"], main a[href*="linkedin.com"]').first()
    ).toBeVisible();
    const cta = page
      .locator('main')
      .getByRole('link')
      .filter({ hasText: /contacto|propuesta/i })
      .first();
    await expect(cta).toBeVisible();
  });

  test('/sobre-mi CTA contacto', async ({ page }) => {
    await gotoReady(page, '/sobre-mi/');
    const cta = page
      .locator('main')
      .getByRole('link')
      .filter({ hasText: /contacto|propuesta/i })
      .first();
    await expect(cta).toBeVisible();
  });

  test('/404 Volver al inicio y Contacto', async ({ page }) => {
    await gotoReady(page, '/404/');
    await expect(page.getByRole('link', { name: /Volver al inicio/i })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: /Contacto/i })).toBeVisible();
  });

  test('artículo presupuesto-web CTA propuesta', async ({ page }) => {
    await gotoReady(page, '/articulos/presupuesto-web/');
    const cta = page
      .locator('main')
      .getByRole('link')
      .filter({ hasText: /propuesta|contacto/i })
      .first();
    await expect(cta).toBeVisible();
  });

  test('/design-system demos disabled/loading y shell', async ({ page }) => {
    await gotoReady(page, '/design-system/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('button', { name: /Disabled/i })).toBeDisabled();
    const loading = page.locator('main button[aria-busy="true"]');
    await expect(loading).toBeVisible();
    await expect(loading).toContainText(/Cargando/i);
  });
});

test.describe('motion — reduced-motion no bloquea interacción', () => {
  test('menú y soft-nav operativos con reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(VIEWPORT_MOBILE);
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-nav')).toBeHidden();

    await page.setViewportSize(VIEWPORT_DESKTOP);
    await gotoReady(page, '/referencias/');
    await page.locator('main a[href^="/referencias/"]').first().click();
    await expect(page.locator('dialog[data-detail-island][open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-detail-island][open]')).toHaveCount(0);
  });
});
