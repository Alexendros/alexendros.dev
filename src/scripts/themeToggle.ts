/** Ciclo sistema → claro → oscuro; sincroniza tema, iconos y localStorage. */

import { THEME_BG_LIGHT, THEME_BG_DARK, getThemeColor } from '../lib/themeColors';

export type ThemeMode = 'system' | 'alexlight' | 'alexdark';

const ORDER: readonly ThemeMode[] = ['system', 'alexlight', 'alexdark'];

const MODE_NAME: Record<ThemeMode, string> = {
  system: 'sistema',
  alexlight: 'claro',
  alexdark: 'oscuro'
};

/** Oscuridad resuelta que ve el usuario (sistema sigue prefers-color-scheme). */
export function resolvesDark(mode: ThemeMode, prefersDark = false): boolean {
  if (mode === 'alexdark') return true;
  if (mode === 'alexlight') return false;
  return prefersDark;
}

/**
 * Avanza en orden documentado (sistema → claro → oscuro → sistema).
 * Si el candidato no cambia el aspecto respecto al modo actual, se salta
 * para que ningún clic sea visualmente nulo (p. ej. alexdark → sistema con
 * OS oscuro).
 */
export function nextThemeMode(mode: ThemeMode, prefersDark = false): ThemeMode {
  const currentDark = resolvesDark(mode, prefersDark);
  const start = ORDER.indexOf(mode);
  const from = start === -1 ? 0 : start;
  for (let step = 1; step <= ORDER.length; step += 1) {
    const candidate = ORDER[(from + step) % ORDER.length]!;
    if (resolvesDark(candidate, prefersDark) !== currentDark) return candidate;
  }
  return currentDark ? 'alexlight' : 'alexdark';
}

export function labelFor(mode: ThemeMode, prefersDark = false): string {
  const next = nextThemeMode(mode, prefersDark);
  return `Tema: ${MODE_NAME[mode]}. Pulsar para ${MODE_NAME[next]}`;
}

function prefersDarkScheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncCmpDarkMode(mode: ThemeMode): void {
  const dark = resolvesDark(mode, prefersDarkScheme());
  document.documentElement.classList.toggle('cc--darkmode', dark);
}

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem('theme');
    if (v === 'alexlight' || v === 'alexdark') return v;
  } catch {
    /* private mode / storage blocked */
  }
  return 'system';
}

function writeStored(mode: ThemeMode): void {
  try {
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);
  } catch {
    /* private mode / storage blocked */
  }
}

function applyThemeColor(mode: ThemeMode) {
  const light = getThemeColor(THEME_BG_LIGHT);
  const dark = getThemeColor(THEME_BG_DARK);
  if (!light && !dark) return;
  const color = mode === 'alexdark' ? dark : mode === 'alexlight' ? light : null;
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((meta, index) => {
    const next = color || (index === 0 ? light : dark);
    if (next) meta.content = next;
  });
}

function syncIcons(button: HTMLButtonElement, mode: ThemeMode) {
  const icons = button.querySelectorAll<HTMLElement>('[data-theme-icon]');
  icons.forEach((el) => {
    const match = el.dataset.themeIcon === mode;
    el.hidden = !match;
    el.setAttribute('aria-hidden', match ? 'false' : 'true');
  });
}

function applyMode(mode: ThemeMode, input: HTMLInputElement, button: HTMLButtonElement) {
  const root = document.documentElement;
  const prefersDark = prefersDarkScheme();
  if (mode === 'system') {
    root.removeAttribute('data-theme');
    input.checked = false;
  } else {
    root.setAttribute('data-theme', mode);
    input.checked = mode === 'alexdark';
  }
  writeStored(mode);
  button.setAttribute('aria-label', labelFor(mode, prefersDark));
  syncIcons(button, mode);
  applyThemeColor(mode);
  syncCmpDarkMode(mode);
}

export function initThemeToggle(): void {
  document.documentElement.classList.add('js');
  const input = document.querySelector<HTMLInputElement>('[data-theme-input]');
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!input || !button) return;
  // Idempotente: el chunk de Layout no debe registrar el clic dos veces.
  if (button.dataset.themeBound === '1') return;
  button.dataset.themeBound = '1';

  let mode = readStored();
  applyMode(mode, input, button);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    mode = nextThemeMode(mode, prefersDarkScheme());
    applyMode(mode, input, button);
  });
}
