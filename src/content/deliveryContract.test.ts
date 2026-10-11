import { describe, expect, it } from 'vitest';
import { catalogEntries } from './services';

describe('contrato comercial del catálogo', () => {
  it('R03: cada ficha tiene precio, pago, plazo, entrega y garantía no vacíos', () => {
    expect(catalogEntries.length).toBeGreaterThanOrEqual(8);
    for (const entry of catalogEntries) {
      expect(entry.priceEuros, entry.id).toBeGreaterThan(0);
      expect(entry.payment.trim().length, `${entry.id}.payment`).toBeGreaterThan(0);
      expect(entry.timeline.trim().length, `${entry.id}.timeline`).toBeGreaterThan(0);
      expect(entry.delivery.trim().length, `${entry.id}.delivery`).toBeGreaterThan(0);
      expect(entry.guarantee.trim().length, `${entry.id}.guarantee`).toBeGreaterThan(0);
    }
  });
});
