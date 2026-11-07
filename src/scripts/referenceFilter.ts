/** Filtro de referencias por tipo de trabajo. Sin JS se muestran todas. */
export function initReferenceFilter(): void {
  const group = document.querySelector<HTMLElement>('[data-ref-filters]');
  const grid = document.querySelector<HTMLElement>('[data-ref-grid]');
  const live = document.querySelector<HTMLElement>('[data-ref-live]');
  const empty = document.querySelector<HTMLElement>('[data-ref-empty]');
  if (!group || !grid) return;

  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button[data-filter]'));
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-kind]'));
  if (buttons.length === 0 || cards.length === 0) return;

  function apply(id: string): void {
    let visible = 0;
    for (const card of cards) {
      const show = id === 'all' || card.dataset.kind === id;
      card.hidden = !show;
      if (show) visible += 1;
    }
    for (const button of buttons) {
      const active = button.dataset.filter === id;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('btn-active', active);
    }
    if (live) {
      live.textContent = `${visible} ${visible === 1 ? 'referencia visible' : 'referencias visibles'}`;
    }
    if (empty) empty.hidden = visible > 0;
    if (grid) grid.hidden = visible === 0;
  }

  group.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button[data-filter]');
    if (button) apply(button.dataset.filter ?? 'all');
  });
}
