/** Ciclo sistema → claro → oscuro; sincroniza theme-controller y localStorage. */

import { THEME_BG_LIGHT, THEME_BG_DARK, getThemeColor } from '../lib/themeColors';

type ThemeMode = 'system' | 'alexlight' | 'alexdark';

const LABELS: Record<ThemeMode, string> = {
  system: 'Tema: sistema. Pulsar para claro',
  alexlight: 'Tema: claro. Pulsar para oscuro',
  alexdark: 'Tema: oscuro. Pulsar para sistema'
};

/** Desde sistema, salta al opuesto del esquema resuelto para que el cambio se note. */
export function nextThemeMode(mode: ThemeMode, prefersDark = false): ThemeMode {
  if (mode === 'system') return prefersDark ? 'alexlight' : 'alexdark';
  if (mode === 'alexlight') return 'alexdark';
  return 'system';
}

function prefersDarkScheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncCmpDarkMode(mode: ThemeMode): void {
  const dark = mode === 'alexdark' || (mode === 'system' && prefersDarkScheme());
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
  const color = mode === 'alexdark' ? dark : mode === 'alexlight' ? light : null;
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((meta, index) => {
    meta.content = color ?? (index === 0 ? light : dark);
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
  if (mode === 'system') {
    root.removeAttribute('data-theme');
    input.checked = false;
  } else {
    root.setAttribute('data-theme', mode);
    input.checked = mode === 'alexdark';
  }
  writeStored(mode);
  button.setAttribute('aria-label', LABELS[mode]);
  syncIcons(button, mode);
  applyThemeColor(mode);
  syncCmpDarkMode(mode);
}

export function initThemeToggle(): void {
  document.documentElement.classList.add('js');
  const input = document.querySelector<HTMLInputElement>('[data-theme-input]');
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!input || !button) return;

  let mode = readStored();
  applyMode(mode, input, button);

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    mode = nextThemeMode(mode, prefersDarkScheme());
    applyMode(mode, input, button);
  });
}
