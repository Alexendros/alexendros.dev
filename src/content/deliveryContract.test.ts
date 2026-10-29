import { describe, expect, it } from 'vitest';
import { portalBase, portalModules } from './portalModules';
import { services } from './services';

describe('contrato de entrega del catálogo', () => {
  it('cada servicio tiene propuesta, plazo, entrega, garantía y exclusiones', () => {
    for (const service of services) {
      const commercial = service.commercial;
      expect(commercial.engagement, service.slug).toBe('proposal');
      expect(commercial.timeline.trim().length, `${service.slug}.timeline`).toBeGreaterThan(0);
      expect(commercial.delivery.trim().length, `${service.slug}.delivery`).toBeGreaterThan(0);
      expect(commercial.guarantee.trim().length, `${service.slug}.guarantee`).toBeGreaterThan(0);
      expect(commercial.exclusions.length, `${service.slug}.exclusions`).toBeGreaterThan(0);
    }
  });

  it('la base y los módulos conservan alcance, entrega y requisitos', () => {
    expect(portalBase.delivery.trim().length).toBeGreaterThan(0);
    expect(portalModules).toHaveLength(4);
    for (const module of portalModules) {
      expect(module.scope.trim().length, `${module.id}.scope`).toBeGreaterThan(0);
      expect(module.delivery.trim().length, `${module.id}.delivery`).toBeGreaterThan(0);
      expect(module.dependencies.length, `${module.id}.dependencies`).toBeGreaterThan(0);
    }
  });
});
