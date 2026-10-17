import { test, expect } from '@playwright/test';
import {
  assertNoUnexpectedEgress,
  installSafeNetwork,
  probeUnauthorizedMutation
} from './fixtures/safe-network';

test.describe('banco de aislamiento', () => {
  test('control positivo: POST no autorizado se aborta y se registra', async ({ page }) => {
    const state = await installSafeNetwork(page.context());
    await page.goto('/');
    const result = await probeUnauthorizedMutation(page);
    expect(result).toBe('aborted');
    expect(state.unexpectedMutations.length).toBeGreaterThan(0);
    expect(state.unexpectedMutations.some((r) => r.pathname.includes('unauthorized'))).toBe(true);
  });

  test('navegación normal sin mutaciones no deja egress inesperado', async ({ page }) => {
    const state = await installSafeNetwork(page.context());
    await page.goto('/');
    await page.goto('/servicios');
    assertNoUnexpectedEgress(state);
  });
});
