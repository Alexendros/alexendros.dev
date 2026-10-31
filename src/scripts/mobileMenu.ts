// Menú móvil accesible (portado del header anterior): botón con
// aria-expanded, Escape cierra y devuelve el foco al botón, clic en enlace
// o fuera cierra. Marca html[data-header-ready] al enlazar listeners.
export function initMobileMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  const isOpen = (): boolean => btn.getAttribute('aria-expanded') === 'true';
  // rAF + timeouts: Enter/Escape y el CMP (vanilla-cookieconsent devuelve el
  // foco a su propio nodo al ocultarse) pueden mover el foco tras el paint.
  const focusWithRetry = (el: HTMLElement): void => {
    const tryFocus = (): void => {
      if (document.activeElement !== el) el.focus({ preventScroll: true });
    };
    tryFocus();
    requestAnimationFrame(() => {
      tryFocus();
      requestAnimationFrame(tryFocus);
    });
    for (const ms of [0, 32, 80]) window.setTimeout(tryFocus, ms);
  };
  const setOpen = (open: boolean): void => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    const first = nav.querySelector<HTMLAnchorElement>('a');
    if (open && first) focusWithRetry(first);
  };

  btn.addEventListener('click', () => setOpen(!isOpen()));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  // capture + stopImmediatePropagation: que el CMP no robe Escape ni el foco.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape' || !isOpen()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
      focusWithRetry(btn);
    },
    true
  );
  document.addEventListener('click', (e) => {
    if (isOpen() && !btn.parentElement?.contains(e.target as Node)) setOpen(false);
  });
  document.documentElement.dataset.headerReady = 'true';
}
