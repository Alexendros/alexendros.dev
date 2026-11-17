import { describe, expect, it } from 'vitest';
import {
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
  SEO_TITLE_MIN,
  allIndexableSeo,
  seoByPath,
  seoForArticle,
  seoForProject,
  seoForService,
  seoSnippetSchema
} from './seo';
import { articles } from './articles';
import { projects } from './projects';
import { services } from './services';

describe('seo snippets indexables', () => {
  it('todas las rutas estáticas cumplen banda title/description', () => {
    for (const [path, snippet] of Object.entries(seoByPath)) {
      const parsed = seoSnippetSchema.safeParse(snippet);
      expect(parsed.success, `${path}: ${parsed.success ? '' : parsed.error.message}`).toBe(true);
    }
  });

  it('todas las fichas y artículos tienen snippet en banda', () => {
    for (const item of allIndexableSeo()) {
      const parsed = seoSnippetSchema.safeParse(item.snippet);
      expect(
        parsed.success,
        `${item.path} title=${item.snippet.title.length} desc=${item.snippet.description.length}`
      ).toBe(true);
      expect(item.snippet.title.length).toBeGreaterThanOrEqual(SEO_TITLE_MIN);
      expect(item.snippet.title.length).toBeLessThanOrEqual(SEO_TITLE_MAX);
      expect(item.snippet.description.length).toBeGreaterThanOrEqual(SEO_DESCRIPTION_MIN);
      expect(item.snippet.description.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
    }
  });

  it('cubre cada servicio, referencia y artículo publicados', () => {
    for (const service of services) expect(() => seoForService(service.slug)).not.toThrow();
    for (const project of projects) expect(() => seoForProject(project.slug)).not.toThrow();
    for (const article of articles) expect(() => seoForArticle(article.slug)).not.toThrow();
  });
});
