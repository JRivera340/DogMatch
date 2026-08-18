import { useEffect, useState } from 'react';
import type { Comunidad, Mascota } from '../types';
import { listarMascotas, vincularMascotaAComunidad } from '../api';
import { codigoCaso } from '../utils/mascotaFormato';
import { SearchOffIcon } from './icons';

interface Props {
  comunidad: Comunidad;
  onClose: () => void;
  /** Se llama tras vincular al menos una mascota, para refrescar el contador en el mapa. */
  onVinculada: () => void;
}

const TAMANO_BUSQUEDA = 200;

/** Busca entre las mascotas ya registradas y las vincula a esta comunidad. Acción pública, sin login. */
export function ModalAgregarMascotaAComunidad({ comunidad, onClose, onVinculada }: Props) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [vinculandoId, setVinculandoId] = useState<string | null>(null);
  const [vinculadas, setVinculadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    listarMascotas(1, TAMANO_BUSQUEDA)
      .then((resp) => setMascotas(resp.items))
      .catch(() => setError('No se pudieron cargar las mascotas.'))
      .finally(() => setCargando(false));
  }, []);

  async function vincular(mascota: Mascota) {
    setVinculandoId(mascota.id);
    setError(null);
    try {
      await vincularMascotaAComunidad(mascota.id, comunidad.id);
      setVinculadas((prev) => new Set(prev).add(mascota.id));
      onVinculada();
    } catch {
      setError('No se pudo vincular esa mascota. Intenta de nuevo.');
    } finally {
      setVinculandoId(null);
    }
  }

  const texto = busqueda.trim().toLowerCase();
  const resultados = mascotas.filter((m) => {
    if (m.comunidadId === comunidad.id) return false;
    if (!texto) return true;
    return (
      m.nombre.toLowerCase().includes(texto) ||
      codigoCaso(m.id).toLowerCase().includes(texto) ||
      m.ultimaVezLugarTexto.toLowerCase().includes(texto)
    );
  });

  return (
    <div
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-ink/60 p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Agregar mascota a ${comunidad.nombre}`}
    >
      <div
        className="max-h-[82vh] w-full max-w-xl overflow-y-auto border-t-4 border-brand-600 bg-paper-raised shadow-[4px_4px_0_rgba(34,29,26,0.2)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5 sm:py-3">
          <div>
            <p className="u-eyebrow">Agregar mascota a</p>
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

        <div className="p-4 sm:p-5">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o lugar..."
            className="u-body w-full border border-line-strong bg-paper px-3 py-2 text-ink focus:border-brand-600 focus:outline-none"
          />

          {error && <p className="u-body mt-2 text-brand-700">{error}</p>}
          {cargando && <p className="u-body mt-3 text-ink-soft">Cargando mascotas...</p>}

          {!cargando && resultados.length === 0 && (
            <div className="mt-3 border border-dashed border-line-strong p-6 text-center">
              <SearchOffIcon className="mx-auto h-6 w-6 text-line-strong" />
              <p className="u-body mt-2 text-ink-soft">Ninguna mascota coincide con esa búsqueda.</p>
            </div>
          )}

          <ul className="mt-3 space-y-1.5">
            {resultados.map((mascota) => {
              const vinculada = vinculadas.has(mascota.id);
              return (
                <li
                  key={mascota.id}
                  className="flex items-center gap-2.5 border border-line px-2.5 py-1.5"
                >
                  <img
                    src={mascota.fotoUrl}
                    alt={mascota.nombre}
                    className="h-10 w-10 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="u-body truncate font-semibold">{mascota.nombre}</p>
                    <p className="u-data truncate text-ink-faint">
                      #{codigoCaso(mascota.id)} · {mascota.ultimaVezLugarTexto}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => vincular(mascota)}
                    disabled={vinculandoId === mascota.id || vinculada}
                    className="u-data shrink-0 border border-brand-600 px-2 py-1 text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
                  >
                    {vinculada ? 'Agregada' : vinculandoId === mascota.id ? 'Agregando...' : 'Agregar'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
