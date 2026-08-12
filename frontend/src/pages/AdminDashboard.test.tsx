import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminDashboard } from './AdminDashboard';
import * as api from '../api';
import { guardarTokenAdmin } from '../adminAuth';
import type { Mascota } from '../types';

vi.mock('../api', () => ({
  adminListarMascotas: vi.fn(),
  adminEliminarMascota: vi.fn(),
  adminActualizarEstado: vi.fn(),
  adminActualizarValidacion: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const mascota: Mascota = {
  id: 'aaaaaaaa-1111-1111-1111-111111111111',
  nombre: 'Firulais',
  especie: 'Perro',
  raza: 'Criollo',
  genero: 'Macho',
  color: 'Café',
  fotoUrl: 'https://example.com/foto.jpg',
  ultimaVezFecha: new Date().toISOString(),
  ultimaVezLugarTexto: 'Parque principal',
  lat: 4.5,
  lng: -74.2,
  lugarResidencia: 'Cra 10 #5-20',
  telefono1: '3001234567',
  telefono2: '3007654321',
  estado: 'perdida',
  validacion: 'pendiente',
  createdAt: new Date().toISOString(),
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirige a /admin si no hay token guardado', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/admin'));
    expect(api.adminListarMascotas).not.toHaveBeenCalled();
  });

  it('lista los casos cuando hay token válido', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue([mascota]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Firulais')).toBeInTheDocument();
    expect(screen.getAllByText('perdida').length).toBeGreaterThan(0);
  });

  it('elimina un caso tras confirmar dos veces', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue([mascota]);
    vi.mocked(api.adminEliminarMascota).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await screen.findByText('Firulais');

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(api.adminEliminarMascota).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() =>
      expect(api.adminEliminarMascota).toHaveBeenCalledWith(mascota.id, 'token-valido'),
    );
    await waitFor(() => expect(screen.queryByText('Firulais')).not.toBeInTheDocument());
  });

  it('alterna el estado del caso', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue([mascota]);
    vi.mocked(api.adminActualizarEstado).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await screen.findByText('Firulais');
    await userEvent.click(screen.getByRole('button', { name: 'Marcar encontrada' }));

    await waitFor(() =>
      expect(api.adminActualizarEstado).toHaveBeenCalledWith(
        mascota.id,
        'encontrada',
        'token-valido',
      ),
    );
  });

  it('aprueba un caso pendiente', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue([mascota]);
    vi.mocked(api.adminActualizarValidacion).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await screen.findByText('Firulais');
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() =>
      expect(api.adminActualizarValidacion).toHaveBeenCalledWith(
        mascota.id,
        'aprobada',
        'token-valido',
      ),
    );
  });

  it('el filtro "Sin validar" se activa y desactiva con el mismo botón', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue([mascota]);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await screen.findByText('Firulais');
    const botonFiltro = screen.getByRole('button', { name: /Sin validar/ });

    await userEvent.click(botonFiltro);
    expect(botonFiltro).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Firulais')).toBeInTheDocument();

    await userEvent.click(botonFiltro);
    expect(botonFiltro).toHaveAttribute('aria-pressed', 'false');
  });
});
