/**
 * Soft-nav de fichas: dialog nativo + pushState sobre el índice.
 * Sin JS, el enlace de la tarjeta navega a [slug] (SEO / deep link).
 */
export function initDetailIsland(): void {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>('dialog[data-detail-island]')
  );
  if (dialogs.length === 0) return;

  const byPath = new Map(dialogs.map((d) => [d.dataset.detailPath ?? '', d]));
  const basePath = dialogs[0]?.dataset.detailBase ?? '';
  let suppressPop = false;
  /** Enlace que abrió el dialog; se restaura el foco al cerrar. */
  let opener: HTMLElement | null = null;

  function restoreUrlOnClose() {
    if (!basePath || location.pathname === basePath) return;
    if (!byPath.has(location.pathname)) return;
    const state = history.state as { detailIsland?: boolean } | null;
    if (state?.detailIsland) {
      // Actualizar la URL de forma sincrona para que el test la vea.
      history.replaceState({ detailIsland: false }, '', basePath);
      // Sacar la entrada del dialog de la pila, sin reabrir.
      suppressPop = true;
      history.back();
    } else {
      history.replaceState({ detailIsland: false }, '', basePath);
    }
  }

  function closeAll() {
    for (const d of dialogs) {
      if (d.open) d.close();
    }
  }

  function openForPath(path: string, push: boolean, fromEl?: HTMLElement | null) {
    const dialog = byPath.get(path);
    if (!dialog) return false;
    for (const d of dialogs) {
      if (d !== dialog && d.open) d.close();
    }
    if (fromEl) opener = fromEl;
    if (!dialog.open) dialog.showModal();
    if (push && location.pathname !== path) {
      suppressPop = true;
      history.pushState({ detailIsland: true, path }, '', path);
      suppressPop = false;
    }
    const closeBtn = dialog.querySelector<HTMLElement>('[data-detail-close]');
    closeBtn?.focus();
    return true;
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('[data-detail-close]')) {
        const dialog = target.closest('dialog[data-detail-island]');
        if (dialog instanceof HTMLDialogElement) {
          event.preventDefault();
          dialog.close();
        }
        return;
      }

      if (target.closest('[data-detail-fullpage]')) {
        return;
      }

      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.origin);
      if (url.origin !== location.origin) return;
      if (!byPath.has(url.pathname)) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      openForPath(url.pathname, true, link);
    },
    true
  );

  for (const dialog of dialogs) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (suppressPop) return;
      restoreUrlOnClose();
      if (opener && typeof opener.focus === 'function') {
        opener.focus({ preventScroll: true });
        opener = null;
      }
    });
  }

  window.addEventListener('popstate', () => {
    if (suppressPop) {
      suppressPop = false;
      return;
    }
    const path = location.pathname;
    if (byPath.has(path)) {
      openForPath(path, false);
      return;
    }
    closeAll();
  });
}
