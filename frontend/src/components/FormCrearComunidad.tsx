import { useState } from 'react';
import { adminCrearComunidad } from '../api';

interface Props {
  lat: number;
  lng: number;
  token: string;
  onCreada: () => void;
  onCancelar: () => void;
}

/** Form breve que aparece tras marcar el punto en el mapa admin, para nombrar la comunidad nueva. */
export function FormCrearComunidad({ lat, lng, token, onCreada, onCancelar }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await adminCrearComunidad({ nombre: nombre.trim(), descripcion: descripcion.trim(), lat, lng }, token);
      onCreada();
    } catch {
      setError('No se pudo crear la comunidad.');
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-ink/60 p-3 sm:p-4"
      onClick={onCancelar}
      role="dialog"
      aria-modal="true"
      aria-label="Nueva comunidad"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm border-t-4 border-brand-600 bg-paper-raised p-4 shadow-[4px_4px_0_rgba(34,29,26,0.2)] sm:p-5"
      >
        <p className="u-eyebrow">Nueva comunidad</p>
        <p className="u-title-card mt-1">Punto marcado en el mapa</p>

        <label className="u-label mt-3 block">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={80}
          autoFocus
          className="u-body mt-1 w-full border border-line-strong bg-paper px-3 py-2 text-ink focus:border-brand-600 focus:outline-none"
        />

        <label className="u-label mt-3 block">Descripción (opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={300}
          rows={2}
          className="u-body mt-1 w-full resize-none border border-line-strong bg-paper px-3 py-2 text-ink focus:border-brand-600 focus:outline-none"
        />

        {error && <p className="u-body mt-2 text-brand-700">{error}</p>}

        <div className="mt-4 flex gap-1.5">
          <button
            type="submit"
            disabled={guardando || !nombre.trim()}
            className="border-2 border-brand-600 bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {guardando ? 'Creando...' : 'Crear comunidad'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="u-data border border-line-strong px-3 py-1.5 text-ink-soft"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
