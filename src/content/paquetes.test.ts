import { describe, expect, it } from 'vitest';
import { paquetes, paquetesPublicados, paquetesVisibles } from './paquetes';

describe('publicación de paquetes', () => {
  it('el interruptor general sigue apagado: no se ve ningún paquete', () => {
    expect(paquetesPublicados).toBe(false);
    expect(paquetesVisibles()).toEqual([]);
  });

  it('cada paquete tiene su bandera: los tres activos', () => {
    const flags = Object.fromEntries(paquetes.map((p) => [p.id, p.publicado]));
    expect(flags).toEqual({ web: true, tienda: true, asistente: true });
  });

  it('con el interruptor encendido solo se ven los paquetes con bandera', () => {
    expect(paquetesVisibles(true).map((p) => p.id)).toEqual(['web', 'tienda', 'asistente']);
    const conUnoOculto = paquetes.map((p) => ({ ...p, publicado: p.id !== 'tienda' }));
    expect(paquetesVisibles(true, conUnoOculto).map((p) => p.id)).toEqual(['web', 'asistente']);
  });
});
