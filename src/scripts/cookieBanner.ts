// El build ESM solo expone exports nombrados; los tipos usan `export =` y
// sugieren un default que no existe en runtime. No convertir a default import.
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
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

function retargetPreferencesBtn() {
  const buttons = document.querySelectorAll('#cc-main button');
  const button = [...buttons].find((element) =>
    /^configurar$/i.test((element.textContent ?? '').trim())
  ) as HTMLButtonElement | undefined;
  if (!button || button.dataset.ccPolicy === '1') return;

  button.dataset.ccPolicy = '1';
  button.setAttribute(
    'aria-label',
    'Configurar cookies: explicación completa y panel para elegir categoría a categoría'
  );
  button.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign('/cookies');
    },
    true
  );
}

function openPreferences(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest('[data-cc="show-preferencesModal"]');
  if (!trigger) return;
  event.preventDefault();
  CookieConsent.showPreferences();
}

/** Inicializa el CMP una sola vez por documento, sin runtime React. */
export function initCookieBanner(): void {
  if (initialized) return;
  initialized = true;

  let observer: MutationObserver | undefined;
  const handleError = (error: unknown) => {
    initialized = false;
    observer?.disconnect();
    document.removeEventListener('click', openPreferences);
    delete document.documentElement.dataset.cmpReady;
    console.error('[cmp] No se pudo inicializar el gestor de consentimiento.', error);
  };

  try {
    observer = new MutationObserver(retargetPreferencesBtn);
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
          layout: 'box inline',
          position: 'bottom center',
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
      onChange: ({ cookie }) => {
        writeConsent(toCategories(cookie));
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        preferences: {},
        analytics: {},
        marketing: {}
      },
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Valoramos tu privacidad',
              description:
                'Guardamos un dato técnico para recordar tu decisión. El resto (medición de visitas y publicidad) no se enciende hasta que tú lo permitas. ' +
                '«Aceptar todas» activa analítica y publicidad. «Rechazar opcionales» deja solo lo técnico. «Configurar» abre el detalle por categoría. ' +
                '<a href="/cookies">Explicación completa en Cookies</a>.',
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
                    'En lenguaje llano: cada fila es un tipo de dato. Lo técnico no se puede apagar porque sin él el sitio no recuerda esta elección. Lo demás es opcional. Detalle, titulares y plazos están en <a href="/cookies">Cookies</a>.'
                },
                {
                  title: 'Técnicas (obligatorias)',
                  description:
                    'En claro: recuerdan que ya respondiste a este aviso, para no preguntártelo cada vez. Grado técnico: cookie de primera parte, 12 meses, sin perfilado. Base: prestar el servicio que pides (art. 6.1.f RGPD y 22.2 LSSI-CE).',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Preferencias (opcionales)',
                  description:
                    'En claro: recuerdan ajustes que tú eliges (por ejemplo un tema). Hoy este sitio casi no las usa. Grado técnico: solo se escriben si las aceptas. Base: consentimiento (art. 6.1.a RGPD).',
                  linkedCategory: 'preferences'
                },
                {
                  title: 'Analítica (opcionales)',
                  description:
                    'En claro: cuentan visitas y clics de forma agregada (Google Analytics, Microsoft Clarity, PostHog en la UE). No sirve para mostrarte anuncios. Grado técnico: identificadores de dispositivo y sesión, 1 día a 2 años. Base: consentimiento.',
                  linkedCategory: 'analytics'
                },
                {
                  title: 'Publicidad (opcionales)',
                  description:
                    'En claro: miden y personalizan campañas (Meta y LinkedIn). Pueden asociar esta visita a un perfil publicitario. Grado técnico: píxeles de terceros, hasta 3 meses. Base: consentimiento. Clave interna: marketing.',
                  linkedCategory: 'marketing'
                }
              ]
            }
          }
        }
      }
    })
      .then(() => {
        document.documentElement.dataset.cmpReady = 'true';
        retargetPreferencesBtn();
        observer?.observe(document.body, { childList: true, subtree: true });
        document.addEventListener('click', openPreferences);
      })
      .catch(handleError);
  } catch (error) {
    handleError(error);
  }
}
