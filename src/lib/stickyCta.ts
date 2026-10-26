import { pathMatches } from './pathMatch';

export type StickyCtaMode = 'default' | 'metodo';

export type StickyCtaClose = {
  heading: string;
  body: string;
  href: string;
};

export type StickyCtaView = {
  show: boolean;
  mode: StickyCtaMode;
  label: string;
  body: string | null;
  href: string;
  alwaysVisible: boolean;
  mobileOnly: boolean;
};

const HIDDEN_ROOTS = ['/contacto', '/gracias'] as const;
const METODO_ROOTS = ['/metodo', '/proceso-y-entrega'] as const;

const DEFAULT_LABEL = 'Solicitar propuesta';
const DEFAULT_HREF = '/contacto?motivo=propuestaComercial';

const HIDDEN: StickyCtaView = {
  show: false,
  mode: 'default',
  label: DEFAULT_LABEL,
  body: null,
  href: DEFAULT_HREF,
  alwaysVisible: false,
  mobileOnly: true
};

/** Decide visibilidad y copy del sticky según la ruta (ADR 0024 + cierre /metodo). */
export function resolveStickyCta(pathname: string, metodoClose: StickyCtaClose): StickyCtaView {
  if (HIDDEN_ROOTS.some((root) => pathMatches(pathname, root))) return HIDDEN;

  if (METODO_ROOTS.some((root) => pathMatches(pathname, root))) {
    return {
      show: true,
      mode: 'metodo',
      label: metodoClose.heading,
      body: metodoClose.body,
      href: metodoClose.href,
      alwaysVisible: true,
      mobileOnly: false
    };
  }

  return {
    show: true,
    mode: 'default',
    label: DEFAULT_LABEL,
    body: null,
    href: DEFAULT_HREF,
    alwaysVisible: false,
    mobileOnly: true
  };
}
