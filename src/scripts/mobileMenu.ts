// Menú móvil accesible: botón con aria-expanded, Escape cierra y devuelve
// el foco al botón, clic fuera o en un enlace cierra. Marca
// html[data-header-ready] cuando los listeners están enlazados.
export function initMobileMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  const setOpen = (open: boolean, returnFocus = false): void => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) nav.querySelector<HTMLAnchorElement>('a')?.focus();
    else if (returnFocus) btn.focus();
  };

  btn.addEventListener('click', () => setOpen(nav.hidden));
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !nav.hidden) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    if (!nav.hidden && !btn.parentElement?.contains(e.target as Node)) setOpen(false);
  });
  document.documentElement.dataset.headerReady = 'true';
}
