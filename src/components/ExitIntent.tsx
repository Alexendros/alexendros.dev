import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '../lib/tracking/events';
import { discounted, formatEuro, provisionalPrices } from '../content/pricing';

const STORAGE_KEY = 'alexendros.exitIntent.v1';
const OFFER_HREF = '/contacto?motivo=propuestaComercial';
const EXCLUDED_PREFIXES = ['/contacto', '/identidad', '/aviso-legal', '/privacidad', '/cookies'];

/**
 * Exit intent: ofrece el informe comercial con 15 % sobre el precio provisional.
 * Una vez por sesión; cierre solo con la X, Escape o el fondo.
 */
export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shownRef = useRef(false);
  const offerTitle = formatEuro(discounted(provisionalPrices.informeComercial));
  const listPrice = formatEuro(provisionalPrices.informeComercial);

  useEffect(() => {
    const path = window.location.pathname;
    if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) return;

    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      return;
    }

    const show = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      setOpen(true);
      track('exit_intent_impression');
    };

    const onLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      show();
    };

    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('alexendros:exit-intent', show as EventListener);
    return () => {
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('alexendros:exit-intent', show as EventListener);
    };
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* almacenamiento no disponible */
    }
    track('exit_intent_dismiss');
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-fg/40"
        onClick={dismiss}
        aria-hidden="true"
        data-exit-intent-backdrop
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
        className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition-colors hover:text-fg focus-ring"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        <p className="font-mono text-xs tracking-[0.1em] text-primary">
          SI TIENES UN NEGOCIO, ESTO TE INTERESA
        </p>
        <h2 id="exit-intent-title" className="mt-2 text-2xl font-bold">
          {listPrice} − 15 % = {offerTitle}
        </h2>
        <p className="mt-2 text-sm text-muted">
          Inspección metodológica de tu dominio web y presencia en internet. Te enviaré un dossier
          informativo de todas las detecciones y hallazgos, así como las áreas que se necesiten
          corregir ya y mis recomendaciones de cómo podríamos construir algo más eficiente para tu
          negocio.
        </p>
        <div className="mt-5">
          <a
            href={OFFER_HREF}
            onClick={() => track('exit_intent_cta_click')}
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Rellenar formulario
          </a>
        </div>
      </div>
    </div>
  );
}
