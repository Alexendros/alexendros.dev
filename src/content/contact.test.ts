import { describe, expect, it } from 'vitest';
import { contact } from './contact';

describe('reservas públicas de contacto R05', () => {
  it('las ofertas de catálogo son formulario y no hay servicios de reserva', () => {
    expect(contact.bookings.offers.every((o) => o.kind === 'form')).toBe(true);
    expect(contact.bookings.offers.map((o) => o.id)).toEqual([
      'informe-comercial',
      'cumplimiento-normativo',
      'ciberseguridad'
    ]);
    for (const offer of contact.bookings.offers) {
      expect(offer.href).toBe('#escribir');
      expect(JSON.stringify(offer)).not.toMatch(/cal\.com/i);
    }
    expect(JSON.stringify(contact)).not.toMatch(/sesion-profesional/i);
    expect(JSON.stringify(contact)).not.toMatch(/retainer/i);
  });

  it('expone formulario y perfiles sociales', () => {
    expect(contact.channels.some((c) => c.id === 'form')).toBe(true);
    expect(contact.channels.some((c) => c.id === 'github')).toBe(true);
    expect(contact.channels.some((c) => c.id === 'linkedin')).toBe(true);
    expect(contact.channels.find((c) => c.id === 'email')?.href).toBe(
      'mailto:contratacion@alexendros.dev'
    );
  });
});
