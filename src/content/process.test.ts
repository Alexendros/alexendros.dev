import { describe, expect, it } from 'vitest';
import {
  processPage,
  type ProcessFaq,
  type ProcessStep,
  type QualityCriterion,
  type WorkingTerm
} from './process';

function nonEmpty(value: string, label: string) {
  expect(value.trim().length, label).toBeGreaterThan(0);
}

describe('processPage — copy público de proceso y entrega', () => {
  it('tiene ids únicos y campos no vacíos en hero, fases, criterios, condiciones y FAQ', () => {
    nonEmpty(processPage.seo.title, 'seo.title');
    nonEmpty(processPage.seo.description, 'seo.description');
    nonEmpty(processPage.hero.h1Lead, 'hero.h1Lead');
    nonEmpty(processPage.hero.h1Accent, 'hero.h1Accent');
    nonEmpty(processPage.hero.lead, 'hero.lead');
    nonEmpty(processPage.hero.primaryCta.label, 'hero.primaryCta.label');
    nonEmpty(processPage.hero.secondaryCta.label, 'hero.secondaryCta.label');
    nonEmpty(processPage.hero.summaryTitle, 'hero.summaryTitle');

    expect(processPage.hero.agreementPoints).toHaveLength(4);
    for (const point of processPage.hero.agreementPoints) nonEmpty(point, 'agreementPoint');

    const stepIds = processPage.steps.map((s: ProcessStep) => s.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    expect(processPage.steps).toHaveLength(4);
    for (const step of processPage.steps) {
      nonEmpty(step.id, `step.${step.id}.id`);
      nonEmpty(step.title, `step.${step.id}.title`);
      nonEmpty(step.description, `step.${step.id}.description`);
      nonEmpty(step.output, `step.${step.id}.output`);
    }

    const criterionIds = processPage.criteria.map((c: QualityCriterion) => c.id);
    expect(new Set(criterionIds).size).toBe(criterionIds.length);
    expect(processPage.criteria).toHaveLength(4);
    for (const criterion of processPage.criteria) {
      nonEmpty(criterion.title, `criterion.${criterion.id}.title`);
      nonEmpty(criterion.benefit, `criterion.${criterion.id}.benefit`);
      nonEmpty(criterion.verification, `criterion.${criterion.id}.verification`);
    }

    const termIds = processPage.terms.map((t: WorkingTerm) => t.id);
    expect(new Set(termIds).size).toBe(termIds.length);
    expect(processPage.terms).toHaveLength(3);
    for (const term of processPage.terms) {
      nonEmpty(term.title, `term.${term.id}.title`);
      nonEmpty(term.description, `term.${term.id}.description`);
    }

    expect(processPage.faqs).toHaveLength(5);
    for (const faq of processPage.faqs as ProcessFaq[]) {
      nonEmpty(faq.question, 'faq.question');
      nonEmpty(faq.answer, 'faq.answer');
    }

    nonEmpty(processPage.evidence.heading, 'evidence.heading');
    nonEmpty(processPage.evidence.body, 'evidence.body');
    nonEmpty(processPage.evidence.linkLabel, 'evidence.linkLabel');
    nonEmpty(processPage.close.heading, 'close.heading');
    nonEmpty(processPage.close.body, 'close.body');
  });

  it('usa CTA a /contacto y ancla de proceso, sin motivo nuevo', () => {
    expect(processPage.hero.primaryCta.label).toBe('Cuéntame qué necesitas');
    expect(processPage.hero.primaryCta.href).toBe('/contacto');
    expect(processPage.hero.secondaryCta.label).toBe('Ver el proceso');
    expect(processPage.hero.secondaryCta.href).toBe('#proceso');
    expect(processPage.close.cta.label).toBe('Cuéntame qué necesitas');
    expect(processPage.close.cta.href).toBe('/contacto');
    expect(processPage.evidence.linkHref).toBe('/proyectos');
    expect(processPage.evidence.linkLabel).toBe('Trabajo que puedes consultar');
  });

  it('ordena las cuatro fases con salida definida', () => {
    expect(processPage.steps.map((s) => s.id)).toEqual([
      'definir',
      'desarrollar-o-analizar',
      'revisar',
      'entregar'
    ]);
    for (const step of processPage.steps) {
      expect(step.output.trim().length).toBeGreaterThan(0);
    }
  });

  it('no anuncia euros, plazos de mantenimiento universal ni nomenclatura interna', () => {
    const joined = JSON.stringify(processPage);
    expect(joined).not.toMatch(/\d+\s*€/);
    expect(joined).not.toMatch(/12\s*meses/i);
    expect(joined).not.toMatch(/2\s*días/i);
    expect(joined).not.toMatch(/Pentalokgo/i);
    expect(joined).not.toMatch(/Sección en desarrollo/i);
    expect(joined).not.toMatch(/implementaci[oó]n incluida/i);
    expect(joined).not.toMatch(/implementaci[oó]n universal/i);
  });

  it('distingue que no todos los servicios implementan cambios', () => {
    const faq = processPage.faqs.find((item) =>
      item.question.includes('se aplica igual a todos los servicios')
    );
    expect(faq).toBeDefined();
    expect(faq?.answer).toMatch(/Solo se implementan cambios cuando están incluidos/);
  });
});
