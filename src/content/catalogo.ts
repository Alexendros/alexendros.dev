import { z } from 'zod';

const nonEmptyTrimmed = z.string().trim().min(1);

export const catalogoCtaSchema = z
  .object({
    label: nonEmptyTrimmed,
    href: nonEmptyTrimmed
  })
  .superRefine((cta, ctx) => {
    if (
      !cta.href.startsWith('/') ||
      cta.href.startsWith('//') ||
      cta.href.includes('\\') ||
      /[\u0000-\u001f]/.test(cta.href)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: `href interno inválido: ${cta.href}`,
        path: ['href']
      });
    }
  });

export const catalogoItemSchema = z.object({
  id: nonEmptyTrimmed,
  titulo: nonEmptyTrimmed,
  descripcion: nonEmptyTrimmed,
  precioOpcional: nonEmptyTrimmed.optional(),
  ctaOpcional: catalogoCtaSchema.optional()
});

export type CatalogoItem = z.infer<typeof catalogoItemSchema>;

const contacto = (origen: string) =>
  `/contacto/?motivo=propuestaComercial&origen=${origen}` as const;

/**
 * Catálogo promocional de `/servicios/`.
 * Tres vías ya autorizadas (revisar, crear, colaborar), con copy distinto al de portada.
 * `precioOpcional` existe en el tipo y no se publica.
 */
export const catalogoPromocional: readonly CatalogoItem[] = [
  {
    id: 'revision',
    titulo: 'Diagnóstico del sitio publicado',
    descripcion:
      'El encargo parte del sitio que ya funciona. Se ordenan los fallos por impacto y se deja un plan de mejoras por escrito.',
    ctaOpcional: {
      label: 'Pedir diagnóstico',
      href: contacto('catalogo-revision')
    }
  },
  {
    id: 'construccion',
    titulo: 'Sitio o tienda a medida',
    descripcion:
      'Se diseña y se publica un sitio profesional, con catálogo y cobro cuando el negocio lo necesita, junto con la documentación de la entrega.',
    ctaOpcional: {
      label: 'Pedir construcción',
      href: contacto('catalogo-construccion')
    }
  },
  {
    id: 'colaboracion',
    titulo: 'Refuerzo por fases',
    descripcion:
      'Se incorpora capacidad a un equipo con un encargo ya en marcha. Cada fase lleva alcance y plazo escritos antes de empezar.',
    ctaOpcional: {
      label: 'Pedir colaboración',
      href: contacto('catalogo-colaboracion')
    }
  }
];

const ids = new Set<string>();
catalogoPromocional.forEach((item, i) => {
  const parsed = catalogoItemSchema.safeParse(item);
  if (!parsed.success) {
    throw new Error(`CatalogoItem ${i} inválido: ${parsed.error.message}`);
  }
  if (ids.has(item.id)) throw new Error(`Catalogo id duplicado: ${item.id}`);
  ids.add(item.id);
});

if (catalogoPromocional.length < 3) {
  throw new Error('El catálogo promocional necesita al menos 3 ítems');
}

for (const item of catalogoPromocional) {
  if (item.precioOpcional !== undefined) {
    throw new Error(
      `CatalogoItem ${item.id}: precioOpcional no se publica (decisión 0025 / check-public-pricing)`
    );
  }
}
