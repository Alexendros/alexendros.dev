import { describe, expect, it } from 'vitest';
import {
  discounted,
  modulePrices,
  portalBasePrice,
  portalTotalWithModules,
  provisionalPrices
} from './pricing';

describe('precios provisionales', () => {
  it('R01: discounted resta el 15 % y redondea a céntimos', () => {
    expect(discounted(provisionalPrices.informeComercial)).toBe(552.5);
    expect(discounted(100)).toBe(85);
    expect(discounted(99.99)).toBe(84.99);
  });

  it('R02: portal más cuatro módulos iguala el total provisional', () => {
    const sum =
      portalBasePrice +
      modulePrices.tienda +
      modulePrices.mensajeria +
      modulePrices.usuarios +
      modulePrices.contenidos;
    expect(sum).toBe(portalTotalWithModules);
    expect(sum).toBe(3900);
  });
});
