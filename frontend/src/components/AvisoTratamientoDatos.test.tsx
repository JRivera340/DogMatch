import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AvisoTratamientoDatos } from './AvisoTratamientoDatos';

describe('AvisoTratamientoDatos', () => {
  it('llama a onChange al marcar el checkbox', async () => {
    const onChange = vi.fn();
    render(<AvisoTratamientoDatos checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('abre el modal con el aviso completo al hacer click en "Leer más"', async () => {
    render(<AvisoTratamientoDatos checked={false} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText('Leer aviso completo'));

    expect(screen.getByText('Aviso de tratamiento de datos personales')).toBeInTheDocument();
  });
});
