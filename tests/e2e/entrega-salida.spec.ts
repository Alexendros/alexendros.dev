import { test, expect } from '@playwright/test';
import { discounted, formatEuro, provisionalPrices } from '../../src/content/pricing';

test('F05: modal de salida muestra oferta del informe y solo cierra con X', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('alexendros.exitIntent.v1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/');
  // Esperar hidratación client:idle del ExitIntent y disparar el evento de prueba.
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      document.dispatchEvent(new Event('alexendros:exit-intent'));
    });
    if (
      await page
        .getByRole('dialog')
        .isVisible()
        .catch(() => false)
    )
      break;
    await page.waitForTimeout(250);
  }

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5_000 });
  await expect(dialog).toContainText('SI TIENES UN NEGOCIO, ESTO TE INTERESA');
  await expect(dialog).toContainText(formatEuro(discounted(provisionalPrices.informeComercial)));
  await expect(dialog).toContainText(/dossier informativo/i);
  await expect(dialog.getByRole('link', { name: 'Rellenar formulario' })).toBeVisible();
  await expect(dialog.getByText('No, gracias')).toHaveCount(0);
  await expect(dialog.getByText('ANTES DE IRTE')).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toHaveCount(0);
});
