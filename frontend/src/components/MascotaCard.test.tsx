import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MascotaCard } from './MascotaCard';
import type { Mascota } from '../types';

vi.mock('../api', () => ({
  marcarEncontrada: vi.fn(),
  obtenerTokensGuardados: vi.fn(() => ({})),
}));

const mascota: Mascota = {
  id: '1',
  nombre: 'Firulais',
  raza: 'Criollo',
  genero: 'Macho',
  fotoUrl: 'https://example.com/foto.jpg',
  ultimaVezFecha: new Date().toISOString(),
  ultimaVezLugarTexto: 'Parque principal',
  lat: 4.5,
  lng: -74.2,
  lugarResidencia: 'Cra 10 #5-20',
  telefono1: '3001234567',
  telefono2: '3007654321',
  estado: 'perdida',
  createdAt: new Date().toISOString(),
};

describe('MascotaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra los datos de la mascota', () => {
    render(<MascotaCard mascota={mascota} />);

    expect(screen.getByText('Firulais')).toBeInTheDocument();
    expect(screen.getByText('Criollo')).toBeInTheDocument();
    expect(screen.getByText(/Parque principal/)).toBeInTheDocument();
    expect(screen.getByText(/Cra 10 #5-20/)).toBeInTheDocument();
  });

  it('muestra botones de contacto para ambos teléfonos', () => {
    render(<MascotaCard mascota={mascota} />);

    const botonesWhatsApp = screen.getAllByRole('link', { name: 'WhatsApp' });
    expect(botonesWhatsApp).toHaveLength(2);
    expect(botonesWhatsApp[0]).toHaveAttribute('href', expect.stringContaining('573001234567'));
    expect(botonesWhatsApp[1]).toHaveAttribute('href', expect.stringContaining('573007654321'));

    expect(screen.getByText('Copiar 3001234567')).toBeInTheDocument();
    expect(screen.getByText('Copiar 3007654321')).toBeInTheDocument();
  });

  it('no muestra botón de "marcar encontrada" sin editToken guardado', () => {
    render(<MascotaCard mascota={mascota} />);

    expect(screen.queryByText('Marcar como encontrada')).not.toBeInTheDocument();
  });
});
