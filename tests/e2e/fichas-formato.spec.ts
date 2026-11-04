import { expect, test } from '@playwright/test';
import { services } from '../../src/content/services';

const retiredSlugs = new Set(['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad']);
const remainingServices = services.filter((service) => !retiredSlugs.has(service.slug));
const expectedSections = [
  'next-step',
  'commercial',
  'audience',
  'process',
  'deliverables',
  'exclusions',
  'requirements',
  'technical'
];

for (const service of remainingServices) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 }
  ]) {
    for (const theme of ['alexlight', 'alexdark'] as const) {
      for (const textScale of [1, 2]) {
        test(`DIS-03: ${service.slug}, ${viewport.width}, ${theme}, texto ${textScale * 100} %`, async ({
          page
        }) => {
          test.fail(true, 'DIS-03: Siguiente paso y formato uniforme pendientes');
          await page.setViewportSize(viewport);
          await page.addInitScript((selectedTheme) => {
            localStorage.setItem('theme', selectedTheme);
          }, theme);
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.goto(`/servicios/${service.slug}/`);
          if (textScale === 2) {
            await page.evaluate(() => {
              document.documentElement.style.fontSize = '200%';
            });
          }

          const detail = page.locator('[data-product-detail]');
          await expect(detail.getByRole('heading', { level: 1 })).toHaveCount(1);
          const sections = await detail
            .locator('[data-product-section]')
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-product-section')));
          expect(sections).toEqual(expectedSections);

          const nextStep = detail.locator('[data-next-step]');
          await expect(nextStep).toHaveCount(1);
          await expect(nextStep).toHaveAttribute('data-product-section', 'next-step');
          const introduction = nextStep.locator('p').first();
          const action = nextStep.getByRole('link', { name: 'Solicitar propuesta', exact: true });
          const facts = nextStep.locator('dl[data-next-step-facts]');
          await expect(introduction).toBeVisible();
          await expect(action).toHaveCount(1);
          await expect(facts).toHaveCount(1);

          const order = await nextStep.evaluate((section) => {
            const intro = section.querySelector('p');
            const link = section.querySelector('a[href^="/contacto/"]');
            const list = section.querySelector('dl[data-next-step-facts]');
            if (intro === null || link === null || list === null) return false;
            return Boolean(
              intro.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING &&
              link.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
            );
          });
          expect(order, 'introducción, acción y lista deben aparecer en ese orden').toBe(true);

          const pairs = facts.locator(':scope > div');
          await expect(pairs).toHaveCount(3);
          await expect(facts.locator('dt')).toHaveText(['Plazo', 'Entrega', 'Garantía']);
          await expect(facts.locator('dd')).toHaveText([
            service.commercial.timeline,
            service.commercial.delivery,
            service.commercial.guarantee
          ]);
          const pairClasses = await pairs.evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute('class'))
          );
          expect(new Set(pairClasses).size, 'los tres pares comparten clase').toBe(1);
          const termStyles = await facts.locator('dt').evaluateAll((nodes) =>
            nodes.map((node) => {
              const style = getComputedStyle(node);
              return [style.fontFamily, style.fontSize, style.textTransform];
            })
          );
          expect(new Set(termStyles.map((style) => JSON.stringify(style))).size).toBe(1);
          await expect(detail.locator('[data-service-badge]')).toHaveCount(0);

          const actionBox = await action.boundingBox();
          const factsBox = await facts.boundingBox();
          expect(actionBox).not.toBeNull();
          expect(factsBox).not.toBeNull();
          expect(actionBox!.width).toBeGreaterThanOrEqual(44);
          expect(actionBox!.height).toBeGreaterThanOrEqual(44);
          const spacing = await page.evaluate(() => {
            const root = getComputedStyle(document.documentElement);
            return (
              Number.parseFloat(root.getPropertyValue('--spacing')) *
              Number.parseFloat(root.fontSize)
            );
          });
          expect(factsBox!.y - (actionBox!.y + actionBox!.height)).toBeGreaterThanOrEqual(spacing);

          const descriptions = await facts.locator('dd').evaluateAll((nodes) =>
            nodes.map((node) => {
              const rect = node.getBoundingClientRect();
              return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                clipped: node.scrollWidth > node.clientWidth + 1
              };
            })
          );
          expect(
            descriptions.every((item) => !item.clipped),
            'ningún dd se recorta'
          ).toBe(true);
          for (let index = 1; index < descriptions.length; index += 1) {
            const previous = descriptions[index - 1]!;
            const current = descriptions[index]!;
            const overlaps =
              previous.left < current.right &&
              previous.right > current.left &&
              previous.top < current.bottom &&
              previous.bottom > current.top;
            expect(overlaps, `los pares ${index} y ${index + 1} no se solapan`).toBe(false);
          }

          const pairBoxes = await pairs.evaluateAll((nodes) =>
            nodes.map((node) => {
              const rect = node.getBoundingClientRect();
              return { left: rect.left, top: rect.top, bottom: rect.bottom };
            })
          );
          if (viewport.width === 1280) {
            expect(
              Math.max(...pairBoxes.map((box) => box.top)) -
                Math.min(...pairBoxes.map((box) => box.top))
            ).toBeLessThanOrEqual(1);
            expect(pairBoxes[0]!.left).toBeLessThan(pairBoxes[1]!.left);
            expect(pairBoxes[1]!.left).toBeLessThan(pairBoxes[2]!.left);
          } else {
            expect(pairBoxes[1]!.top).toBeGreaterThanOrEqual(pairBoxes[0]!.bottom - 1);
            expect(pairBoxes[2]!.top).toBeGreaterThanOrEqual(pairBoxes[1]!.bottom - 1);
          }

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          expect(overflow).toBeLessThanOrEqual(1);
        });
      }
    }
  }
}
