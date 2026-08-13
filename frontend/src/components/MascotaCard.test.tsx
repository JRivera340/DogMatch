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
  tipoReporte: 'perdida',
  especie: 'Perro',
  raza: 'Criollo',
  genero: 'Macho',
  color: 'Café',
  tamano: 'Mediano',
  edad: 'Adulto',
  senasParticulares: '',
  senas: [],
  otrasSenas: '',
  esUrgente: false,
  esAsustadiza: false,
  fotoUrl: 'https://example.com/foto.jpg',
  ultimaVezFecha: new Date().toISOString(),
  ultimaVezLugarTexto: 'Parque principal',
  lat: 4.5,
  lng: -74.2,
  nombreContacto: 'Juan Pérez',
  emailContacto: 'juan@ejemplo.com',
  telefono1: '3001234567',
  telefono2: '3007654321',
  estado: 'perdida',
  validacion: 'pendiente',
  clicks: 0,
  createdAt: new Date().toISOString(),
};

describe('MascotaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra los datos de la mascota', () => {
    render(<MascotaCard mascota={mascota} />);

    expect(screen.getByText('Firulais')).toBeInTheDocument();
    expect(screen.getByText(/Criollo/)).toBeInTheDocument();
    expect(screen.getByText(/Parque principal/)).toBeInTheDocument();
    expect(screen.getByText('Sin validar')).toBeInTheDocument();
  });

  it('muestra botones de contacto con un número de funcionario asignado, no el del reportante', () => {
    render(<MascotaCard mascota={mascota} />);

    // Since mascota.id is '1', '1'.charCodeAt(0) % 2 === 49 % 2 === 1.
    // TELEFONOS_FUNCIONARIOS[1] is '3113440504'.
    const botonWhatsApp = screen.getByRole('link', { name: /Contáctanos por WhatsApp/i });
    expect(botonWhatsApp).toHaveAttribute('href', expect.stringContaining('573113440504'));
    expect(screen.queryByText('3001234567')).not.toBeInTheDocument();
  });

  it('no muestra botón de "marcar encontrada" sin editToken guardado', () => {
    render(<MascotaCard mascota={mascota} />);

    expect(screen.queryByText('Marcar como encontrada')).not.toBeInTheDocument();
  });
});
