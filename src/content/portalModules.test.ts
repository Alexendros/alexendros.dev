import { describe, expect, it } from 'vitest';
import {
  normalizePortalModuleIds,
  PORTAL_MODULE_IDS,
  portalBase,
  portalModules,
  portalModuleSchema,
  serializePortalModuleIds,
  type PortalModuleId
} from './portalModules';

describe('módulos del sitio profesional', () => {
  it('conserva IDs, alcance y dependencias sin dominio económico', () => {
    expect(portalModules.map((module) => module.id)).toEqual([...PORTAL_MODULE_IDS]);
    expect(portalBase.id).toBe('portal-inicio');
    for (const module of portalModules) {
      expect(portalModuleSchema.safeParse(module).success).toBe(true);
      expect(module.scope.trim().length).toBeGreaterThan(0);
      expect(module.dependencies.length).toBeGreaterThan(0);
      expect(module).not.toHaveProperty('payment');
    }
  });

  it('normaliza las 16 combinaciones sin duplicados y con orden canónico', () => {
    const count = PORTAL_MODULE_IDS.length;
    for (let mask = 0; mask < 1 << count; mask += 1) {
      const selected: PortalModuleId[] = [];
      for (let index = 0; index < count; index += 1) {
        if (mask & (1 << index)) selected.push(PORTAL_MODULE_IDS[index]!);
      }
      expect(normalizePortalModuleIds([...selected, ...selected].reverse())).toEqual(selected);
      expect(normalizePortalModuleIds(serializePortalModuleIds(selected))).toEqual(selected);
    }
  });
});

describe('normalización de IDs', () => {
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

  it('acepta separadores conocidos y rechaza entradas no textuales', () => {
    expect(normalizePortalModuleIds(['contenidos', 'tienda', 'usuarios'].join(';'))).toEqual([
      'tienda',
      'usuarios',
      'contenidos'
    ]);
    expect(normalizePortalModuleIds(['tienda', 1, null, 'tienda'])).toEqual(['tienda']);
    expect(normalizePortalModuleIds({ id: 'tienda' })).toEqual([]);
  });
});
