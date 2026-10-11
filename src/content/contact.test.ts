import { describe, expect, it } from 'vitest';
import { contact, publicBookingEvents } from './contact';

describe('reservas públicas de contacto R05', () => {
  it('el informe no tiene Cal.com y la sesión apunta a sesion-tecnica', () => {
    const informe = contact.bookings.offers.find((o) => o.id === 'informe-comercial');
    const sesion = contact.bookings.offers.find((o) => o.id === 'sesion-profesional');
    expect(informe?.kind).toBe('form');
    if (informe?.kind === 'form') {
      expect(informe.href).toBe('#escribir');
      expect(JSON.stringify(informe)).not.toMatch(/cal\.com/i);
    }
    expect(sesion?.kind).toBe('cal');
    if (sesion?.kind === 'cal') {
      expect(sesion.calLink).toBe('alexendros/sesion-tecnica');
      expect(sesion.url).toBe('https://cal.com/alexendros/sesion-tecnica');
    }
    expect(publicBookingEvents.map((e) => e.calLink)).toEqual(['alexendros/sesion-tecnica']);
    expect(JSON.stringify(contact)).not.toMatch(/retainer/i);
    expect(JSON.stringify(contact)).not.toMatch(/diagnostico/i);
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
