import { describe, expect, it } from 'vitest';
import { contact } from './contact';

describe('reservas públicas de contacto R05', () => {
  it('no quedan ofertas de catálogo retiradas ni servicios de reserva', () => {
    expect(contact.bookings.offers).toEqual([]);
    expect(JSON.stringify(contact)).not.toMatch(/sesion-profesional/i);
    expect(JSON.stringify(contact)).not.toMatch(/retainer/i);
    expect(JSON.stringify(contact)).not.toMatch(
      /informe-comercial|cumplimiento-normativo|ciberseguridad/i
    );
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
