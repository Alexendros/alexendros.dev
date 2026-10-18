import { describe, expect, it } from 'vitest';
import { formatEuro, provisionalPrices } from './pricing';
import { processPage, type ProcessFaq, type ProcessStep } from './process';

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

describe('processPage — copy público de proceso y entrega', () => {
  it('tiene seo, hero, 4 pasos, 3 caminos, 4 FAQ y cierre con CTA medibles', () => {
    nonEmpty(processPage.seo.title, 'seo.title');
    nonEmpty(processPage.seo.description, 'seo.description');
    nonEmpty(processPage.hero.h1Lead, 'hero.h1Lead');
    nonEmpty(processPage.hero.h1Accent, 'hero.h1Accent');
    nonEmpty(processPage.hero.lead, 'hero.lead');
    expect(processPage.hero.guarantees).toHaveLength(3);

    expect(processPage.steps).toHaveLength(4);
    const stepIds = processPage.steps.map((s: ProcessStep) => s.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    for (const step of processPage.steps) {
      nonEmpty(step.title, `step.${step.id}.title`);
      nonEmpty(step.duration, `step.${step.id}.duration`);
      nonEmpty(step.description, `step.${step.id}.description`);
      nonEmpty(step.receive, `step.${step.id}.receive`);
    }

    expect(processPage.paths).toHaveLength(3);
    expect(processPage.faqs).toHaveLength(4);
    for (const faq of processPage.faqs as ProcessFaq[]) {
      nonEmpty(faq.question, 'faq.question');
      nonEmpty(faq.answer, 'faq.answer');
    }

    nonEmpty(processPage.close.heading, 'close.heading');
    nonEmpty(processPage.limits.body, 'limits.body');
  });

  it('usa CTA con origen=proceso hacia presupuesto, precios y Cal.com', () => {
    expect(processPage.hero.primaryCta.label).toBe('Pedir presupuesto');
    expect(processPage.hero.primaryCta.href).toContain('/contacto');
    expect(processPage.hero.primaryCta.href).toContain('origen=proceso');
    expect(processPage.hero.primaryCta.href).toContain('motivo=propuestaComercial');
    expect(processPage.hero.secondaryCta.href).toContain('/servicios');
    expect(processPage.hero.secondaryCta.href).toContain('origen=proceso');
    expect(processPage.close.primaryCta.href).toContain('origen=proceso');
    expect(processPage.close.secondaryCta.href).toMatch(/^https:\/\//);
  });

  it('ordena las cuatro fases hablamos → escrito → construyo → publico', () => {
    expect(processPage.steps.map((s) => s.id)).toEqual([
      'hablamos',
      'escrito',
      'construyo',
      'publico'
    ]);
  });

  it('muestra precios ya publicados del catálogo y software sin cifra inventada', () => {
    const joined = visibleCopy();
    expect(joined).toContain(formatEuro(provisionalPrices.portalInicio));
    expect(joined).toContain(formatEuro(provisionalPrices.informeComercial));
    expect(joined).toContain('+ IVA');
    expect(processPage.paths.find((p) => p.id === 'software')?.priceLabel).toBe(
      'Precio por fase en la propuesta'
    );
  });

  it('mantiene densidad baja y evita el glosario técnico', () => {
    const copy = visibleCopy();
    expect(wordCount(copy)).toBeLessThanOrEqual(400);
    for (const term of PROCESS_JARGON) {
      expect(copy.toLowerCase(), term).not.toContain(term.toLowerCase());
    }
  });

  it('declara propiedad del resultado y límites sin tono defensivo largo', () => {
    const ownership = processPage.faqs.find((f) => f.question.includes('dueño'));
    expect(ownership?.answer).toMatch(/código/i);
    expect(processPage.limits.body).toMatch(/No prometo ventas/);
  });
});
