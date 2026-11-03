/** Si el script del formulario no hidrata, muestra el correo alternativo. */
const fallback = document.querySelector<HTMLElement>('[data-contact-fallback]');
if (fallback) {
  window.setTimeout(() => {
    if (document.documentElement.dataset.contactHydrated !== 'true') fallback.hidden = false;
  }, 1200);
}
