import { describe, expect, it } from 'vitest';
import { PROJECT_FICHA_CTA, availabilityCtaLabels, projects, projectSchema } from './projects';

describe('formato canónico de ficha', () => {
  it('cada obra pasa el schema y alimenta el mismo contrato de ficha', () => {
    for (const project of projects) {
      const { cover: _cover, ...data } = project;
      expect(projectSchema.safeParse(data).success, project.slug).toBe(true);
      expect(project.context.length).toBeGreaterThan(0);
      expect(project.solution.length).toBeGreaterThan(0);
      expect(project.responsibilities.length).toBeGreaterThan(0);
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.highlights.length).toBeGreaterThan(0);
      expect(project.links.prod || project.links.github).toBeTruthy();
      expect(availabilityCtaLabels[project.availability]).toBe(PROJECT_FICHA_CTA);
    }
  });
});

describe('disponibilidad de publicaciones', () => {
  it('asigna sí|no|reservado a cada obra', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p.availability]));
    expect(bySlug['front-valencia']).toBe('si');
    expect(bySlug['graficas-nasve']).toBe('si');
    expect(bySlug['zedazo']).toBe('reservado');
    expect(bySlug['alexendros-me']).toBe('no');
  });

  it('declara workKind sin inferirlo por dominio', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p.workKind]));
    expect(bySlug['front-valencia']).toBe('encargo');
    expect(bySlug['graficas-nasve']).toBe('encargo');
    expect(bySlug['zedazo']).toBe('propio');
    expect(bySlug['alexendros-me']).toBe('propio');
  });

  it('los enlaces públicos son https de lectura, no checkout', () => {
    for (const project of projects) {
      if (project.links.prod) {
        expect(project.links.prod).toMatch(/^https:\/\//);
        expect(project.links.prod).not.toMatch(/\/checkout|\/cart|\/pay\b/i);
      }
      if (project.links.github) {
        expect(project.links.github).toMatch(/^https:\/\/github\.com\//);
      }
    }
  });

  it('conserva las URL de Vercel confirmadas para Front y Nasve', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(bySlug['front-valencia'].links.prod).toBe('https://website-frontvalencia.vercel.app/');
    expect(bySlug['graficas-nasve'].links.prod).toBe('https://ecommerce-graficasnasve.vercel.app/');
    for (const project of projects) {
      expect(project.links.prod ?? '').not.toMatch(/frontvalencia\.(com|es)/i);
    }
  });

  it('solo dos referencias destacadas y sin herramientas internas', () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(2);
    const forbidden = /pnpm|Turborepo|TypeScript estricto|Payload|Railway/i;
    for (const project of projects) {
      for (const technology of project.technologies) {
        expect(technology).not.toMatch(forbidden);
      }
    }
  });
});
