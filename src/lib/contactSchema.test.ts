import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  formatContactFieldErrors,
  isHoneypotFilled,
  parseContactBody,
  validateContactStep
} from './contactSchema';

const validCorreo = {
  name: 'Alex Endros',
  entityType: 'particular' as const,
  channel: 'correo' as const,
  email: 'alex@example.com',
  reason: 'propuestaComercial' as const,
  message: 'Quiero un informe comercial para mi dominio.',
  consent: true as const
};

const validWhatsapp = {
  name: 'Alex Endros',
  entityType: 'empresa' as const,
  channel: 'whatsapp' as const,
  phone: '+34 600 000 000',
  reason: 'proyectoEspecial' as const,
  message: 'Necesito una sesión para priorizar el siguiente paso.',
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

  it('rechaza sin mensaje de petición', () => {
    const { message: _m, ...rest } = validCorreo;
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

  it('rechaza markup peligroso en el mensaje', () => {
    expect(
      parseContactBody({
        ...validCorreo,
        message: 'Hola <script>alert(1)</script> necesito ayuda ya.'
      }).success
    ).toBe(false);
  });
});

describe('validateContactStep', () => {
  it('rechaza teléfono con caracteres no permitidos en el paso canal', () => {
    const errors = validateContactStep('channel', {
      name: 'Alex',
      entityType: 'particular',
      channel: 'whatsapp',
      phone: 'abc-not-a-phone',
      email: '',
      reason: 'informacionCliente',
      message: 'Petición suficientemente larga.',
      consent: false
    });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('rechaza markup en el mensaje en su paso', () => {
    const errors = validateContactStep('message', {
      name: 'Alex',
      entityType: 'particular',
      channel: 'correo',
      phone: '',
      email: 'a@b.co',
      reason: 'informacionCliente',
      message: 'Hola <script>x</script> necesito ayuda ya.',
      consent: false
    });
    expect(errors.some((e) => e.field === 'message')).toBe(true);
  });
});

describe('formatContactFieldErrors', () => {
  it('nombra campo y causa de falta de contenido', () => {
    const parsed = parseContactBody({ ...validCorreo, message: '' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = formatContactFieldErrors(parsed.error);
    expect(errors.some((e) => e.label === 'Tu petición' && e.cause === 'falta contenido')).toBe(
      true
    );
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
