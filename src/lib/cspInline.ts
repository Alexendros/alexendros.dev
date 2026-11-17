/** Contenidos inline estables usados por Layout y por la CSP (hashes). */

export const LAYER_ORDER_STYLE = '@layer properties, reset, theme, base, components, utilities;';

/** Debe coincidir byte a byte con src/scripts/theme-init.js. */
export const THEME_INIT_SOURCE = `(function () {
  try {
    var root = document.documentElement;
    root.classList.add('js');
    var stored = localStorage.getItem('theme');
    if (stored === 'alexlight' || stored === 'alexdark') {
      root.setAttribute('data-theme', stored);
    }
    var dark =
      stored === 'alexdark' ||
      (stored !== 'alexlight' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('cc--darkmode', dark);
  } catch (err) {
    void err;
  }
})();
`;
