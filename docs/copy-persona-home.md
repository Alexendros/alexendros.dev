# Informe: persona gramatical fuera del Hero (home)

Alcance: cadenas en 1.ª o 2.ª persona que quedan en la home o en metadatos globales tras la decisión 0021. El Hero y «¿Qué necesitas?» quedan en tercera persona. No se reescriben aquí las páginas `/sobre-mi` ni `/metodo`.

| Fichero                                     | Línea (aprox.)         | Cadena                             | Persona detectada    |
| ------------------------------------------- | ---------------------- | ---------------------------------- | -------------------- |
| `src/layouts/Layout.astro` (JSON-LD Person) | jobTitle/description   | `profile.role` / `profile.summary` | 1.ª (vía profile.ts) |
| `src/content/profile.ts`                    | role, summary, method… | Textos de Sobre mí                 | 1.ª / 2.ª            |
| `src/pages/sobre-mi.astro`                  | CTA                    | «Cuéntame qué necesitas»           | 2.ª / imperativo     |
| `src/content/process.ts`                    | close.heading          | «Cuéntame qué necesitas»           | 2.ª / imperativo     |
| `src/pages/contacto.astro`                  | no-JS / privacidad     | «te responda», «Usaré tus datos»   | 1.ª / 2.ª            |

Seguimiento: issue «Unificar persona gramatical en la home» (#131).
