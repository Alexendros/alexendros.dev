import { test, expect } from '@playwright/test';

test('F01: home es hero + nav; sin secciones en página', async ({ page }) => {
  await page.goto('/');

  const h1 = page.getByRole('heading', {
    level: 1,
    name: /Aquí se crean productos digitales que son reflejo de/
  });
  await expect(h1).toBeVisible();
  await expect(h1).toHaveAccessibleName(
    /personalidad individual y reputación profesional.*proyectos empresariales e iniciativas sociales.*cualidades humanas de alto valor/
  );
  await expect(page.getByText(/El dominio donde despliegue tu portal/)).toBeVisible();
  await expect(page.getByLabel(/Pare las rotativas/)).toBeVisible();

  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Contactar' })).toBeVisible();
  await expect(page.locator('[data-hero]').getByRole('link', { name: 'Contactar' })).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Contactar' })).toHaveCount(
    0
  );

  // El hueco del H1 no puede quedarse en blanco entre frases (timing linear + solape).
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const emptyFrames = await page.evaluate(async () => {
    const gaps: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 9500) {
      const opacities = [...document.querySelectorAll('.hero-slot-item')].map((el) =>
        Number(getComputedStyle(el).opacity)
      );
      if (!opacities.some((o) => o > 0.2)) gaps.push(Math.round(performance.now() - t0));
      await new Promise((r) => setTimeout(r, 150));
    }
    return gaps;
  });
  expect(emptyFrames, `H1 vacío en t=${emptyFrames.join(',')}`).toEqual([]);

  await expect(banner.getByRole('link', { name: 'Servicios', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Publicaciones', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Metodología', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Valores', exact: true })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Servicios', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Publicaciones', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Metodología', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Valores', exact: true })).toHaveCount(0);
  await expect(page.getByText('DISEÑO WEB · VALENCIA')).toHaveCount(0);
  await expect(page.getByText('Disponible para nuevos proyectos')).toHaveCount(0);
});
