import { describe, expect, it } from 'vitest';
import { escapeHtml, isHoneypotFilled, parseContactBody } from './contactSchema';

const validCorreo = {
  name: 'Alex Endros',
  entityType: 'particular' as const,
  channel: 'correo' as const,
  email: 'alex@example.com',
  reason: 'propuestaComercial' as const,
  consent: true as const
};

const validWhatsapp = {
  name: 'Alex Endros',
  entityType: 'empresa' as const,
  channel: 'whatsapp' as const,
  phone: '+34 600 000 000',
  reason: 'proyectoEspecial' as const,
  consent: true as const
};

describe('parseContactBody R04', () => {
  it('acepta correo con email y sin teléfono', () => {
    expect(parseContactBody(validCorreo).success).toBe(true);
  });

  it('acepta WhatsApp con teléfono y sin email', () => {
    expect(parseContactBody(validWhatsapp).success).toBe(true);
  });

  it('rechaza formulario incompleto (sin motivo)', () => {
    const { reason: _r, ...rest } = validCorreo;
    expect(parseContactBody(rest).success).toBe(false);
  });

  it('rechaza WhatsApp sin teléfono', () => {
    expect(parseContactBody({ ...validWhatsapp, phone: undefined }).success).toBe(false);
  });

  it('rechaza correo sin email', () => {
    expect(parseContactBody({ ...validCorreo, email: undefined }).success).toBe(false);
  });

  it('rechaza consent distinto de true', () => {
    expect(parseContactBody({ ...validCorreo, consent: false }).success).toBe(false);
  });

  it('rechaza un email de más de 254 caracteres', () => {
    expect(
      parseContactBody({
        ...validCorreo,
        email: `${'a'.repeat(243)}@example.com`
      }).success
    ).toBe(false);
  });
});

describe('isHoneypotFilled', () => {
  it('detecta honeypot relleno', () => {
    expect(isHoneypotFilled('bot')).toBe(true);
    expect(isHoneypotFilled('')).toBe(false);
    expect(isHoneypotFilled(undefined)).toBe(false);
  });
});

describe('escapeHtml', () => {
  it('escapa caracteres peligrosos', () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe(
      '&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;'
    );
  });
});
