/** Ciclo sistema → claro → oscuro; sincroniza theme-controller y localStorage. */

import { THEME_BG_LIGHT, THEME_BG_DARK, getThemeColor } from '../lib/themeColors';

type ThemeMode = 'system' | 'alexlight' | 'alexdark';

const LABELS: Record<ThemeMode, string> = {
  system: 'Tema: sistema. Pulsar para claro',
  alexlight: 'Tema: claro. Pulsar para oscuro',
  alexdark: 'Tema: oscuro. Pulsar para sistema'
};

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem('theme');
    if (v === 'alexlight' || v === 'alexdark') return v;
  } catch {
    /* ignore */
  }
  return 'system';
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
    try {
      localStorage.removeItem('theme');
    } catch {
      /* ignore */
    }
    input.checked = false;
  } else if (mode === 'alexlight') {
    root.setAttribute('data-theme', 'alexlight');
    try {
      localStorage.setItem('theme', 'alexlight');
    } catch {
      /* ignore */
    }
    input.checked = false;
  } else {
    root.setAttribute('data-theme', 'alexdark');
    try {
      localStorage.setItem('theme', 'alexdark');
    } catch {
      /* ignore */
    }
    input.checked = true;
  }
  button.setAttribute('aria-label', LABELS[mode]);
  syncIcons(button, mode);
  applyThemeColor(mode);
}

export function initThemeToggle(): void {
  document.documentElement.classList.add('js');
  const input = document.querySelector<HTMLInputElement>('[data-theme-input]');
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!input || !button) return;

  let mode = readStored();
  applyMode(mode, input, button);

  button.addEventListener('click', () => {
    mode = mode === 'system' ? 'alexlight' : mode === 'alexlight' ? 'alexdark' : 'system';
    applyMode(mode, input, button);
  });
}
