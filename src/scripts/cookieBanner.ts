// El build ESM solo expone exports nombrados; los tipos usan `export =` y
// sugieren un default que no existe en runtime. No convertir a default import.
import * as CookieConsent from 'vanilla-cookieconsent';
import './cookieBanner.css';
import {
  CONSENT_CATEGORIES,
  CONSENT_COOKIE,
  CONSENT_EXPIRES_DAYS,
  consentVersion,
  writeConsent,
  type ConsentCategory
} from '../lib/tracking/consent';

type CookieValue = { categories?: string[] };

let initialized = false;

function toCategories(cookie: CookieValue | undefined): ConsentCategory[] {
  const raw = Array.isArray(cookie?.categories) ? cookie.categories : [];
  return raw.filter((item): item is ConsentCategory =>
    (CONSENT_CATEGORIES as readonly string[]).includes(item)
  );
}

function openPreferences(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest('[data-cc="show-preferencesModal"]');
  if (!trigger) return;
  CookieConsent.showPreferences();
  if (document.documentElement.classList.contains('show--preferences')) event.preventDefault();
}

/** Inicializa el CMP una sola vez por documento, sin runtime React. */
export function initCookieBanner(): void {
  if (initialized) return;
  initialized = true;

  const handleError = (error: unknown) => {
    initialized = false;
    document.removeEventListener('click', openPreferences);
    delete document.documentElement.dataset.cmpReady;
    console.error('[cmp] No se pudo inicializar el gestor de consentimiento.', error);
  };

  try {
    void CookieConsent.run({
      revision: consentVersion(),
      cookie: {
        name: CONSENT_COOKIE,
        expiresAfterDays: CONSENT_EXPIRES_DAYS,
        sameSite: 'Lax',
        path: '/'
      },
      guiOptions: {
        consentModal: {
          layout: 'bar inline',
          position: 'bottom',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          equalWeightButtons: true,
          flipButtons: false
        }
      },
      onFirstConsent: ({ cookie }) => {
        writeConsent(toCategories(cookie));
      },
      onChange: ({ cookie, changedCategories }) => {
        const categories = toCategories(cookie);
        writeConsent(categories);
        if (changedCategories.includes('analytics') && !categories.includes('analytics')) {
          // Los scripts de Vercel ya ejecutados no ofrecen una parada pública.
          window.location.reload();
        }
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {}
      },
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Valoramos tu privacidad',
              description:
                'Un dato técnico recuerda tu elección.<br>' +
                'Analítica (Vercel Analytics y Speed Insights): solo si la permites.<br>' +
                '<strong>Aceptar todas</strong> activa la analítica. ' +
                '<strong>Rechazar opcionales</strong> deja solo lo técnico. ' +
                '<strong>Configurar</strong> abre el detalle.<br>' +
                '<a href="/cookies/">Explicación completa en Cookies</a>.',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar opcionales',
              showPreferencesBtn: 'Configurar'
            },
            preferencesModal: {
              title: 'Elige qué se activa',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar opcionales',
              savePreferencesBtn: 'Guardar esta elección',
              closeIconLabel: 'Cerrar panel de cookies',
              sections: [
                {
                  title: 'Qué implica cada interruptor',
                  description:
                    'En lenguaje llano: cada fila es un tipo de dato. Lo técnico no se puede apagar porque sin él el sitio no recuerda esta elección. Lo demás es opcional. Detalle, titulares y plazos están en <a href="/cookies/">Cookies</a>.'
                },
                {
                  title: 'Técnicas (obligatorias)',
                  description:
                    'En claro: recuerdan que ya respondiste a este aviso, para no preguntártelo cada vez. Grado técnico: cookie de primera parte, 12 meses, sin perfilado. Base: prestar el servicio que pides (art. 6.1.f RGPD y 22.2 LSSI-CE).',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Analítica (opcionales)',
                  description:
                    'En claro: cuentan visitas y rendimiento de forma agregada (Vercel Analytics y Speed Insights), solo en el despliegue de Vercel. No sirve para mostrarte anuncios. Base: consentimiento.',
                  linkedCategory: 'analytics'
                }
              ]
            }
          }
        }
      }
    })
      .then(() => {
        document.documentElement.dataset.cmpReady = 'true';
        document.addEventListener('click', openPreferences);
      })
      .catch(handleError);
  } catch (error) {
    handleError(error);
  }
}
