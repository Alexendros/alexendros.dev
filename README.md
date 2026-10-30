# Alexendros — Tecnologías y servicios informáticos

Sitio profesional de [alexendros.dev](https://alexendros.dev): sitios web, integración de catálogo y pagos, auditoría técnica SEO y colaboración en proyectos de software. Desde Valencia.

## Servicios y colaboración técnica

| Servicio                                                                                                            | Para quién                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Sitio web profesional](https://alexendros.dev/servicios/#portal-heading)                                           | Profesionales y negocios locales que necesitan una web clara lista para captar consultas |
| [Auditoría técnica SEO](https://alexendros.dev/servicios/informe-comercial/)                                        | Quienes necesitan un informe SEO técnico y un plan de ajustes con métricas verificables  |
| [Revisión técnica de privacidad, cookies y accesibilidad](https://alexendros.dev/servicios/cumplimiento-normativo/) | Protección de datos, políticas de cookies y accesibilidad                                |
| [Revisión básica de seguridad web](https://alexendros.dev/servicios/ciberseguridad/)                                | Vulnerabilidades básicas priorizadas, sin prueba de intrusión                            |
| [Colaboración en proyectos de software](https://alexendros.dev/servicios/software-a-medida/)                        | Refuerzo técnico por fases en proyectos grandes con más compañeros                       |

Más detalle y solicitud de propuesta en [Servicios](https://alexendros.dev/servicios/). Metodología en [Metodología](https://alexendros.dev/metodo/). Referencias en [Referencias](https://alexendros.dev/referencias/).

## Cómo empezar

1. Solicitud de propuesta en [Contacto](https://alexendros.dev/contacto/) o correo a [contratacion@alexendros.dev](mailto:contratacion@alexendros.dev).
2. Alcance, plazos y condiciones se acuerdan por escrito antes de empezar.
3. Entrega y revisión según lo acordado.

Atención a distancia o presencialmente en Valencia. El sitio prioriza claridad, accesibilidad y velocidad; el tracking comercial solo se carga con consentimiento previo y granular.

## Este repositorio

Código fuente **público** del sitio en producción ([`Alexendros/alexendros.dev`](https://github.com/Alexendros/alexendros.dev)). Para contribuir o desplegar, empieza por [CONTRIBUTING](CONTRIBUTING.md). Arquitectura en [ARCHITECTURE.md](ARCHITECTURE.md); estándares, protocolos y registros en [docs/](docs/). Contrato para agentes: [AGENTS.md](AGENTS.md). Plan de cierre y evidencias: [PLAN-CIERRE-SHIP](docs/plans/PLAN-CIERRE-SHIP.md). Avisos de seguridad: [SECURITY.md](SECURITY.md).

```bash
pnpm i
pnpm dev    # http://localhost:4321
```

Node 22 + pnpm 9.15.9 (`packageManager`). Producción en Vercel Hobby (`alexendros-dev`); el merge a `main` publica el sitio.
