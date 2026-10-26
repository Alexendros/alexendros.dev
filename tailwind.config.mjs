/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    // Fixtures de vitest no deben generar utilidades en el CSS de producción.
    '!**/*.{test,spec}.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      // Fuente única de verdad: :root en src/styles/global.css (decisión 0011).
      // No duplicar valores literales aquí; los translúcidos usan
      // color-mix sobre var(--brand) porque Tailwind v3 no aplica
      // /<alpha> sobre var().
      colors: {
        bg: 'var(--bg)',
        subtle: 'var(--bg-subtle)',
        scrim: 'var(--scrim)',
        fg: 'var(--fg)',
        primary: 'var(--brand)',
        primaryHover: 'var(--brand-hover)',
        primarySoft: 'color-mix(in srgb, var(--brand) 40%, transparent)',
        primaryGhost: 'var(--primary-ghost)',
        muted: 'var(--fg-muted)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        card: 'var(--card)',
        ink: 'var(--brand-fg)',
        danger: 'var(--danger)'
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'monospace']
      },
      // Escala fluida --step-* (global.css). Uso: text-step-4 en H1 de página.
      fontSize: {
        'step-0': 'var(--step-0)',
        'step-1': 'var(--step-1)',
        'step-2': 'var(--step-2)',
        'step-3': 'var(--step-3)',
        'step-4': ['var(--step-4)', { lineHeight: 'var(--leading-tight)' }]
      }
    }
  },
  plugins: []
};
