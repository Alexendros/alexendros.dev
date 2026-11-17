/** Contenidos inline estables usados por Layout y por la CSP (hashes). */

export const LAYER_ORDER_STYLE = '@layer properties, reset, theme, base, components, utilities;';

/** Debe coincidir byte a byte con src/scripts/theme-init.js. */
export const THEME_INIT_SOURCE = `(function () {
  try {
    document.documentElement.classList.add('js');
    var stored = localStorage.getItem('theme');
    if (stored === 'alexlight' || stored === 'alexdark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (err) {
    void err;
  }
})();
`;
