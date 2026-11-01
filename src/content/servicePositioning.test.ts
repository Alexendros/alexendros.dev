import { describe, expect, it } from 'vitest';
import { services } from './services';

const EXPECTED_TITLES = {
  'informe-comercial': 'Revisión técnica para aparecer en buscadores',
  'cumplimiento-normativo': 'Revisión técnica de privacidad, cookies y accesibilidad',
  ciberseguridad: 'Revisión básica de seguridad web',
  'software-a-medida': 'Colaboración en proyectos de programación'
} as const;

describe('posicionamiento editorial de servicios', () => {
  it('usa la taxonomía acordada sin cambiar los slugs', () => {
    expect(Object.fromEntries(services.map((service) => [service.slug, service.title]))).toEqual(
      EXPECTED_TITLES
    );
  });

  it('incluye requisitos del cliente y CTA a propuesta en cada ficha', () => {
    for (const service of services) {
      expect(service.requirements.length, service.slug).toBeGreaterThan(0);
      expect(service.action.label, service.slug).toBe('Solicitar propuesta');
      expect(service.commercial.engagement, service.slug).toBe('proposal');
    }
  });

  it('evita promesas absolutas de cumplimiento, seguridad y cobro', () => {
    const copy = JSON.stringify(services);
    expect(copy).not.toMatch(/cumple la normativa|sitio seguro|sin vulnerabilidades/gi);
    expect(copy).not.toMatch(/sin violaciones de accesibilidad|cobro seguro/gi);
  });
});
