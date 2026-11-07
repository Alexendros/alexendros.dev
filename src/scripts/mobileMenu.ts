// Menú móvil accesible: botón con aria-expanded, Escape cierra y
// devuelve el foco al botón, clic en enlace o fuera cierra. Mientras
// está abierto, main y footer quedan inert. Marca html[data-header-ready].
export function initMobileMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  const inertTargets = (): HTMLElement[] =>
    [document.getElementById('main'), document.querySelector('footer')].filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );

  const isOpen = (): boolean => btn.getAttribute('aria-expanded') === 'true';
  // rAF + timeouts: Enter/Escape y el CMP (vanilla-cookieconsent) pueden
  // mover el foco tras el paint.
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

  const setInert = (open: boolean): void => {
    for (const el of inertTargets()) {
      if (open) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    }
  };

  const setOpen = (open: boolean): void => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    setInert(open);
    if (open) {
      const first = nav.querySelector<HTMLAnchorElement>('a');
      if (first) focusWithRetry(first);
    } else {
      focusWithRetry(btn);
    }
  };

  btn.addEventListener('click', () => setOpen(!isOpen()));
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
      setInert(false);
    })
  );
  // capture + stopImmediatePropagation: que el CMP no robe Escape ni el foco.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape' || !isOpen()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    },
    true
  );
  document.addEventListener('click', (e) => {
    if (isOpen() && !btn.parentElement?.contains(e.target as Node)) setOpen(false);
  });
  document.documentElement.dataset.headerReady = 'true';
}
