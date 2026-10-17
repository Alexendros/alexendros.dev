import { describe, expect, it } from 'vitest';
import {
  discounted,
  modulePrices,
  normalizePortalModuleIds,
  PORTAL_MODULE_IDS,
  portalBasePrice,
  portalTotalWithModules,
  provisionalPrices,
  serializePortalModuleIds,
  sumPortal,
  type PortalModuleId
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

describe('CFG-01: total de combinaciones de módulos', () => {
  it('las 16 combinaciones suman base + precios únicos sin duplicar la base', () => {
    const n = PORTAL_MODULE_IDS.length;
    for (let mask = 0; mask < 1 << n; mask += 1) {
      const selected: PortalModuleId[] = [];
      let expected = portalBasePrice;
      for (let i = 0; i < n; i += 1) {
        if (mask & (1 << i)) {
          const id = PORTAL_MODULE_IDS[i]!;
          selected.push(id);
          expected += modulePrices[id];
        }
      }
      expect(sumPortal(selected)).toBe(expected);
      expect(sumPortal([...selected, ...selected])).toBe(expected);
    }
  });
});

describe('CFG-02: normalización de IDs', () => {
  it('deduplica, descarta desconocidos y fija orden canónico', () => {
    expect(
      normalizePortalModuleIds(['contenidos', 'tienda', 'tienda', 'fake', 'usuarios', 'mensajeria'])
    ).toEqual(['tienda', 'mensajeria', 'usuarios', 'contenidos']);
    expect(
      normalizePortalModuleIds(['usuarios', 'tienda', '<script>', 'precio'].join(','))
    ).toEqual(['tienda', 'usuarios']);
    expect(
      serializePortalModuleIds(normalizePortalModuleIds(['contenidos', 'tienda'].join(',')))
    ).toBe(['tienda', 'contenidos'].join(','));
  });

  it('IDs desconocidos o duplicados no manipulan el total', () => {
    expect(sumPortal(['tienda', 'nope', 'tienda', 'evil'])).toBe(
      portalBasePrice + modulePrices.tienda
    );
    expect(sumPortal([])).toBe(portalBasePrice);
  });
});
