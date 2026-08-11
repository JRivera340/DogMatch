import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminLogin } from './AdminLogin';
import * as api from '../api';

vi.mock('../api', () => ({
  adminLogin: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('guarda el token y navega al dashboard con contraseña correcta', async () => {
    vi.mocked(api.adminLogin).mockResolvedValue({ token: 'token-valido' });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText('Contraseña'), 'clave-correcta');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(api.adminLogin).toHaveBeenCalledWith('clave-correcta');
    expect(localStorage.getItem('dogmatch_admin_token')).toBe('token-valido');
    expect(navigateMock).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('muestra error con contraseña incorrecta y no navega', async () => {
    vi.mocked(api.adminLogin).mockRejectedValue(new Error('401'));

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText('Contraseña'), 'clave-mala');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Contraseña incorrecta.')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
