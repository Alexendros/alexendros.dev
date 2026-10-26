import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/servicios',
  '/servicios/software-a-medida',
  '/metodo',
  '/proyectos',
  '/proyectos/zedazo',
  '/contacto'
];

const forbidden = [
  /provisional/i,
  /Preparando/i,
  /VCF Cribador/i,
  /hola@alexendros/i,
  /Disponibilidad habla/i,
  /pentest/i,
  /recorridos/i,
  /hallazgos/i
];

for (const p of pages) {
  test(`sin ruido, un h1 y pie coherente: ${p}`, async ({ page }) => {
    await page.goto(p);
    await expect(page.locator('h1')).toHaveCount(1);
    const text = await page.locator('main').innerText();
    for (const re of forbidden) expect(text).not.toMatch(re);
    await expect(page.locator('footer a[href="/contacto"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/sobre-mi"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="mailto:contratacion@alexendros.dev"]')).toBeVisible();
  });
}

test('pasos sin numeración duplicada', async ({ page }) => {
  await page.goto('/metodo');
  const titles = await page.locator('ol h2').allInnerTexts();
  for (const t of titles) expect(t).not.toMatch(/^\s*0\d/);
});

test('enlaces con mismo texto no apuntan a destinos distintos (home)', async ({ page }) => {
  await page.goto('/');
  const links = await page.$$eval('main a', (as) =>
    as.map((a) => [a.textContent!.trim(), (a as HTMLAnchorElement).pathname])
  );
  const map = new Map<string, Set<string>>();
  for (const [t, h] of links) {
    map.set(t, (map.get(t) ?? new Set()).add(h));
  }
  for (const [t, hs] of map) {
    expect(hs.size, `«${t}» apunta a ${[...hs]}`).toBe(1);
  }
});

test('contacto: sin placeholder y motivo aplicado', async ({ page }) => {
  await page.goto('/contacto?motivo=propuestaComercial&origen=proceso');
  await expect(page.getByText('Preparando el formulario')).toHaveCount(0);
  await expect(page.locator('select[name="reason"], #contact-reason')).toHaveValue(
    'propuestaComercial'
  );
  const honeypot = page.locator('#contact-website');
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  await expect(honeypot).toHaveAttribute('autocomplete', 'off');
  const trap = page.locator('.honeypot[aria-hidden="true"]');
  await expect(trap).toHaveCount(1);
  await expect(trap.locator('#contact-website')).toHaveCount(1);
  const box = await honeypot.boundingBox();
  expect(box === null || box.x < 0 || box.width <= 1).toBeTruthy();
});
