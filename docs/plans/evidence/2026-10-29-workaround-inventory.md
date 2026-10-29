# Inventario inicial de restos y workarounds

Fecha: 2026-10-29.

Clasificación provisional basada en referencias estáticas. No autoriza borrados: cada retirada exige búsqueda de consumidores, build y pruebas.

| Elemento                                              | Estado                                                   | Tratamiento y criterio de salida                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `scripts/fix-vercel-runtime.mjs`                      | Workaround activo en `pnpm build`                        | Revisar contra `@astrojs/vercel` 11 y el runtime desplegado; retirar solo si la salida funciona sin él         |
| `scripts/check-csp.mjs`                               | Informe por defecto; `--enforce` opcional                | Mantener informe durante corrección CSP; activar gate al estabilizar política y pruebas                        |
| `osv-scanner.toml`                                    | Excepciones de vulnerabilidades en toolchain             | Repetir análisis actual, retirar entradas sin uso y fechar toda aceptación residual                            |
| Overrides de `package.json` / `pnpm-workspace.yaml`   | Sincronizados, numerosos                                 | Justificar cada uno; retirar los obsoletos con lockfile y pruebas reproducibles                                |
| `RESEND_API_KEY`, `EMAIL_FROM*`, `UNSUBSCRIBE_SECRET` | Integración retirada; nombres aún en `.env.example`      | Verificar que no hay consumidor ni variable real; retirar residuos de ejemplo, documentación y dashboard       |
| `docs/standards/protocols/env-vars.md`                | Contiene rollback de lead magnet y referencias retiradas | Corregir en fase documental/privacidad sin borrar instrucciones vigentes                                       |
| `PUBLIC_GTM_SS_DOMAIN`                                | Documentado como referencia sin consumidor runtime       | Confirmar despliegue real; retirar de docs/CSP si está inactivo                                                |
| `NOTION_LEADS_DATABASE_ID` de ejemplo                 | Identificador con formato real en `.env.example`         | Sustituir por placeholder inequívoco si no es un ID de prueba intencional; revisar exposición de configuración |
| `scripts/env-collect.mjs`                             | Hint `_readEnvFile` sin uso                              | Confirmar ausencia de consumidor dinámico y eliminar en clean-code si es muerto                                |
| Husky: gitleaks ausente                               | Aviso y omisión local; CI sí ejecuta Gitleaks            | Conservar aviso, no confundirlo con escaneo completado; opcionalmente facilitar instalación local              |
| `lighthouserc.json`                                   | Sube informes a almacenamiento público temporal          | Usar solo URLs públicas no sensibles; conservar resultados tabulados ante caducidad                            |
| `docs/audits/archive/`                                | Histórico con importes, nombres y estados antiguos       | Conservar como histórico, nunca como instrucción vigente ni excepción de gates                                 |
| Ocho hints de `astro check`                           | No bloqueantes                                           | Revisar en clean-code sin elevarlos artificialmente a fallos ni ignorarlos al declarar deuda                   |

## Próximas unidades de trabajo

Sin asignar números de PR anticipados:

1. **Rendimiento CMP:** sustitución de la isla React global guiada por el diagnóstico de JavaScript.
2. **Privacidad y contrato de contacto:** primera capa, `privacyAcknowledged`, canales y conservación.
3. **Limpieza de configuración retirada:** Resend, GTM inactivo y ejemplos obsoletos tras verificar consumidores.
4. **CSP:** inventario de orígenes, política efectiva, navegador y activación del gate.
5. **Clean-code:** formulario, contenido/esquemas, CSS y eliminación comprobada de código muerto.

Estas unidades no autorizan compras, cambios comerciales ni borrados. Se coordinan para evitar modificaciones simultáneas de formulario, CMP o catálogo.
