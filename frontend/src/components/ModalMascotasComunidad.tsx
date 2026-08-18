import { useEffect, useState } from 'react';
import type { Comunidad, Mascota } from '../types';
import { listarMascotasDeComunidad } from '../api';
import { MascotaCard } from './MascotaCard';
import { PawIcon } from './icons';

interface Props {
  comunidad: Comunidad;
  onClose: () => void;
}

/** Lista las mascotas vinculadas a una comunidad, con el mismo card que usa el panel público. */
export function ModalMascotasComunidad({ comunidad, onClose }: Props) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarMascotasDeComunidad(comunidad.id)
      .then((resp) => setMascotas(resp.items))
      .catch(() => setError('No se pudieron cargar las mascotas de esta comunidad.'))
      .finally(() => setCargando(false));
  }, [comunidad.id]);

  return (
    <div
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-ink/60 p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Mascotas de ${comunidad.nombre}`}
    >
      <div
        className="max-h-[82vh] w-full max-w-2xl overflow-y-auto border-t-4 border-brand-600 bg-paper-raised shadow-[4px_4px_0_rgba(34,29,26,0.2)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5 sm:py-3">
          <div>
            <p className="u-eyebrow">Mascotas de la comunidad</p>
            <p className="u-title-card mt-0.5">{comunidad.nombre}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="u-data border border-line-strong px-2.5 py-1 text-ink-soft hover:border-brand-600 hover:text-brand-700"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {cargando && <p className="u-body text-ink-soft">Cargando...</p>}
          {error && <p className="u-body text-brand-700">{error}</p>}
          {!cargando && !error && mascotas.length === 0 && (
            <div className="border border-dashed border-line-strong p-6 text-center">
              <PawIcon className="mx-auto h-6 w-6 text-line-strong" />
              <p className="u-body mt-2 text-ink-soft">
                Todavía no hay mascotas registradas en esta comunidad.
              </p>
            </div>
          )}
          {mascotas.map((mascota) => (
            <MascotaCard key={mascota.id} mascota={mascota} />
          ))}
        </div>
      </div>
    </div>
  );
}
