import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminDashboard } from './AdminDashboard';
import * as api from '../api';
import { guardarTokenAdmin } from '../adminAuth';
import type { Mascota, Paginado } from '../types';

function paginaDe(items: Mascota[]): Paginado<Mascota> {
  return { items, page: 1, pageSize: 100, total: items.length, totalPages: 1 };
}

vi.mock('../api', () => ({
  adminListarMascotas: vi.fn(),
  adminEliminarMascota: vi.fn(),
  adminActualizarTipo: vi.fn(),
  adminActualizarValidacion: vi.fn(),
  listarComunidades: vi.fn(() => Promise.resolve([])),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const mascota: Mascota = {
  id: 'aaaaaaaa-1111-1111-1111-111111111111',
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
  comunidadId: null,
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
    vi.mocked(api.adminListarMascotas).mockResolvedValue(paginaDe([mascota]));

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Validación' }));

    expect(await screen.findByText('Firulais')).toBeInTheDocument();
    expect(screen.getAllByText('Perdido').length).toBeGreaterThan(0);
  });

  it('elimina un caso tras confirmar dos veces', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue(paginaDe([mascota]));
    vi.mocked(api.adminEliminarMascota).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Validación' }));
    await screen.findByText('Firulais');

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(api.adminEliminarMascota).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() =>
      expect(api.adminEliminarMascota).toHaveBeenCalledWith(mascota.id, 'token-valido'),
    );
    await waitFor(() => expect(screen.queryByText('Firulais')).not.toBeInTheDocument());
  });

  it('cambia el tipo/estado del caso con el selector de 3 opciones', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue(paginaDe([mascota]));
    vi.mocked(api.adminActualizarTipo).mockResolvedValue({
      tipoReporte: 'perdida',
      estado: 'encontrada',
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Validación' }));
    await screen.findByText('Firulais');
    await userEvent.selectOptions(screen.getByDisplayValue('Perdido'), 'encontrada');

    await waitFor(() =>
      expect(api.adminActualizarTipo).toHaveBeenCalledWith(
        mascota.id,
        'encontrada',
        'token-valido',
      ),
    );
  });

  it('aprueba un caso pendiente', async () => {
    guardarTokenAdmin('token-valido');
    vi.mocked(api.adminListarMascotas).mockResolvedValue(paginaDe([mascota]));
    vi.mocked(api.adminActualizarValidacion).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Validación' }));
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
    vi.mocked(api.adminListarMascotas).mockResolvedValue(paginaDe([mascota]));

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Validación' }));
    await screen.findByText('Firulais');
    const botonFiltro = screen.getByRole('button', { name: /Sin validar/ });

    await userEvent.click(botonFiltro);
    expect(botonFiltro).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Firulais')).toBeInTheDocument();

    await userEvent.click(botonFiltro);
    expect(botonFiltro).toHaveAttribute('aria-pressed', 'false');
  });
});
