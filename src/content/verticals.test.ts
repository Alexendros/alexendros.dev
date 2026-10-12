import { describe, expect, it } from 'vitest';
import { services } from './services';
import { verticals } from './verticals';

const serviceSlugs = new Set(services.map((s) => s.slug));

describe('verticals apuntan a servicios existentes', () => {
  it('todo relatedService es un slug de services.ts', () => {
    for (const v of verticals) {
      expect(serviceSlugs.has(v.relatedService), `${v.slug}: ${v.relatedService}`).toBe(true);
    }
  });

  it('todo cta lleva un slug servicio= de services.ts', () => {
    for (const v of verticals) {
      const servicio = new URL(v.cta, 'https://alexendros.dev').searchParams.get('servicio');
      expect(servicio, `${v.slug}: ${v.cta}`).not.toBeNull();
      expect(serviceSlugs.has(servicio ?? ''), `${v.slug}: ${v.cta}`).toBe(true);
    }
  });

  it('todo cta conserva el contexto vertical= de su sector', () => {
    for (const v of verticals) {
      const vertical = new URL(v.cta, 'https://alexendros.dev').searchParams.get('vertical');
      expect(vertical, `${v.slug}: ${v.cta}`).toBe(v.slug);
    }
  });
});
