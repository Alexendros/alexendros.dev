import { test, expect } from '@playwright/test';

test('C-06: H1 del hero y logo alineados a 1280 px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const delta = await page.evaluate(() => {
    const logo = document.querySelector('#site-header a[href="/#top"]');
    const h1 = document.querySelector('#top h1');
    if (!logo || !h1) return 999;
    return Math.abs(h1.getBoundingClientRect().left - logo.getBoundingClientRect().left);
  });
  expect(delta, `desfase logo/H1 ${delta}px`).toBeLessThanOrEqual(24);
});

test('C-11: cabecera con menú móvil a 768 px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/');
  const info = await page.evaluate(() => {
    const header = document.getElementById('site-header');
    const desktopNav = header?.querySelector('.navbar-center');
    const mobileMenu = header?.querySelector('[data-menu-button]');
    const menuWrapper = mobileMenu?.parentElement;
    const navDisplay = desktopNav ? getComputedStyle(desktopNav).display : 'none';
    const menuDisplay = menuWrapper ? getComputedStyle(menuWrapper).display : 'none';
    return {
      headerH: header?.getBoundingClientRect().height ?? 0,
      navDisplay,
      menuDisplay
    };
  });
  expect(info.navDisplay).toBe('none');
  expect(info.menuDisplay).not.toBe('none');
  expect(info.headerH).toBeGreaterThan(40);
});

for (const width of [1024, 1280] as const) {
  test(`M-08: cabecera en una sola fila a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const info = await page.evaluate(() => {
      const header = document.getElementById('site-header');
      const logo = header?.querySelector('a[href="/#top"]');
      const cta = header?.querySelector('a.btn-primary');
      const links = [...(header?.querySelectorAll('.navbar-center a') ?? [])];
      if (!header || !logo || !cta || links.length < 3) return null;
      const logoTop = logo.getBoundingClientRect().top;
      const ctaTop = cta.getBoundingClientRect().top;
      const linkTops = links.map((a) => a.getBoundingClientRect().top);
      return {
        headerH: header.getBoundingClientRect().height,
        logoTop,
        ctaTop,
        linkTops,
        sameRow: Math.abs(logoTop - ctaTop) <= 2
      };
    });
    expect(info).not.toBeNull();
    expect(info!.sameRow, 'logo y CTA en la misma fila').toBe(true);
    expect(info!.headerH, `headerH ${info!.headerH}`).toBeLessThanOrEqual(80);
    for (const top of info!.linkTops) {
      expect(Math.abs(top - info!.logoTop), 'nav en la misma fila que el logo').toBeLessThanOrEqual(
        8
      );
    }
  });
}

test('skip-link: foco visible con padding usable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const box = await page.evaluate(() => {
    const link = document.querySelector('.skip-link');
    if (!(link instanceof HTMLElement)) return null;
    link.focus();
    const cs = getComputedStyle(link);
    const rect = link.getBoundingClientRect();
    return {
      paddingInline: parseFloat(cs.paddingInlineStart) + parseFloat(cs.paddingInlineEnd),
      height: rect.height,
      width: rect.width
    };
  });
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(40);
  expect(box!.paddingInline).toBeGreaterThan(0);
  expect(box!.width).toBeGreaterThan(80);
});
