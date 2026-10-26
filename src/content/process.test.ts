import { describe, expect, it } from 'vitest';
import { processPage, type ProcessStep } from './process';

/** Términos del glosario comercial a evitar en la página pública. */
const PROCESS_JARGON = [
  'recorridos',
  'hallazgos',
  'pentest',
  'cabeceras',
  'entrega comprobable',
  'controles automáticos',
  'exposición de datos',
  'hitos de revisión',
  'continuidad definida'
] as const;

function nonEmpty(value: string, label: string) {
  expect(value.trim().length, label).toBeGreaterThan(0);
}

function collectVisibleStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (!value.startsWith('/') && !value.startsWith('http') && !value.includes('origen=')) {
      out.push(value);
    }
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectVisibleStrings(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'seo' || key === 'id' || key === 'href') continue;
      collectVisibleStrings(child, out);
    }
  }
  return out;
}

function visibleCopy(): string {
  return collectVisibleStrings(processPage).join(' ');
}

function wordCount(text: string): number {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

describe('processPage — copy público de metodología', () => {
  it('tiene seo, hero, 4 pasos y cierre con CTA medible', () => {
    nonEmpty(processPage.seo.title, 'seo.title');
    nonEmpty(processPage.seo.description, 'seo.description');
    expect(processPage.seo.description).toMatch(/desde la idea hasta el producto entregado/i);
    nonEmpty(processPage.hero.h1Lead, 'hero.h1Lead');
    expect(processPage.hero.h1Lead).toBe('Metodología clara e integral.');
    expect(processPage.hero.h1Accent).toMatch(/^\sDesde/);
    expect(processPage.hero).not.toHaveProperty('lead');
    expect(processPage.hero).not.toHaveProperty('primaryCta');
    expect(processPage).not.toHaveProperty('processSection');

    expect(processPage.steps).toHaveLength(4);
    const stepIds = processPage.steps.map((s: ProcessStep) => s.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    for (const step of processPage.steps) {
      nonEmpty(step.title, `step.${step.id}.title`);
      nonEmpty(step.duration, `step.${step.id}.duration`);
      nonEmpty(step.description, `step.${step.id}.description`);
      nonEmpty(step.receive, `step.${step.id}.receive`);
    }

    expect(processPage.steps.find((s) => s.id === 'escrito')?.receive).toBe(
      'un contrato vinculante.'
    );
    expect(processPage.steps.find((s) => s.id === 'construyo')?.title).toBe(
      'Desarrollo y construcción'
    );
    expect(processPage.steps.find((s) => s.id === 'publico')?.title).toBe(
      'Previsualización y entrega'
    );
    expect(processPage.steps.find((s) => s.id === 'publico')?.receive).toMatch(
      /Producto acordado con instrucciones de uso y soporte para incidencias/
    );

    expect(processPage.close.heading).toBe('Solicitar presupuesto');
    expect(processPage.close.body).toMatch(/lo antes posible/i);
    expect(processPage.close).not.toHaveProperty('primaryCta');
  });

  it('usa CTA de cierre con origen=proceso hacia presupuesto', () => {
    expect(processPage.close.href).toContain('/contacto');
    expect(processPage.close.href).toContain('origen=proceso');
    expect(processPage.close.href).toContain('motivo=propuestaComercial');
  });

  it('ordena las cuatro fases hablamos → escrito → construyo → publico', () => {
    expect(processPage.steps.map((s) => s.id)).toEqual([
      'hablamos',
      'escrito',
      'construyo',
      'publico'
    ]);
  });

  it('mantiene densidad baja y evita el glosario técnico', () => {
    const copy = visibleCopy();
    expect(wordCount(copy)).toBeLessThanOrEqual(400);
    for (const term of PROCESS_JARGON) {
      expect(copy.toLowerCase(), term).not.toContain(term.toLowerCase());
    }
  });
});
