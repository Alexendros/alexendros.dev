# Informe: persona gramatical fuera del Hero (home)

Inventario de 1.ª y 2.ª persona que permanece en la home por debajo del Hero y en el JSON-LD `Person`. **Sin editar** esas cadenas en este incremento: no hay copy de recambio aprobado.

| Fichero                  | Línea | Cadena                                                     | Persona                     |
| ------------------------ | ----- | ---------------------------------------------------------- | --------------------------- |
| `src/pages/index.astro`  | 14    | Para que te encuentren y te escriban.                      | 2.ª                         |
| `src/pages/index.astro`  | 21    | Me integro en proyectos grandes con el equipo, por fases.  | 1.ª                         |
| `src/pages/index.astro`  | 27    | Revisar tu web                                             | 2.ª                         |
| `src/pages/index.astro`  | 36    | Hablamos sin coste                                         | 1.ª                         |
| `src/pages/index.astro`  | 37    | Lo dejamos por escrito                                     | 1.ª                         |
| `src/pages/index.astro`  | 38    | Lo construyo con avances visibles                          | 1.ª                         |
| `src/pages/index.astro`  | 39    | Lo probamos y lo publico                                   | 1.ª                         |
| `src/pages/index.astro`  | 49    | ¿Qué necesitas?                                            | 2.ª                         |
| `src/pages/index.astro`  | 69    | Cómo trabajo                                               | 1.ª                         |
| `src/pages/index.astro`  | 94    | Qué hice.                                                  | 1.ª                         |
| `src/content/profile.ts` | 5     | La persona detrás de Alexendros. Diseño y desarrollo webs… | 1.ª (verbo implícito / rol) |
| `src/content/profile.ts` | 11–12 | Hago webs… Me encargo de todo el proceso…                  | 1.ª                         |

El nodo JSON-LD `Person` en `Layout.astro` usa `profile.role` y `profile.summary`; por eso la 1.ª persona del perfil aparece también en el marcado estructurado de todas las páginas, incluida la home.

Seguimiento: issue «Unificar persona gramatical en la home».
