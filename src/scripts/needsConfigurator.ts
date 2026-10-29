import {
  normalizePortalModuleIds,
  portalModules,
  serializePortalModuleIds
} from '../content/portalModules';

const roots = document.querySelectorAll('[data-needs-configurator]');

for (const root of roots) {
  const summary = root.querySelector('[data-needs-empty]');
  const selectedList = root.querySelector('[data-needs-selected]');
  const cta = root.querySelector('[data-needs-cta]');
  if (!(summary instanceof HTMLElement) || !(selectedList instanceof HTMLElement)) continue;
  if (!(cta instanceof HTMLAnchorElement)) continue;

  root.addEventListener('change', () => {
    const checked = root.querySelectorAll('input[data-module]:checked');
    const selected = normalizePortalModuleIds(
      [...checked].map((input) => (input as HTMLInputElement).value)
    );
    const selectedModules = portalModules.filter((module) => selected.includes(module.id));

    summary.hidden = selectedModules.length > 0;
    selectedList.hidden = selectedModules.length === 0;
    selectedList.replaceChildren(
      ...selectedModules.map((module) => {
        const item = document.createElement('li');
        item.textContent = module.title;
        return item;
      })
    );

    const baseQuery = 'motivo=propuestaComercial&origen=servicios';
    cta.href = selected.length
      ? `/contacto?${baseQuery}&modulos=${encodeURIComponent(serializePortalModuleIds(selected))}`
      : `/contacto?${baseQuery}`;
  });
}
