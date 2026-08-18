import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Comunidad, Mascota } from '../types';
import { listarComunidades, listarMascotasDeComunidad } from '../api';
import { MascotaCard } from '../components/MascotaCard';
import { ChevronIcon, PawIcon } from '../components/icons';

const TAMANO_PAGINA = 50;

/**
 * Página propia de una comunidad — a la que lleva "Ver mascotas" desde el popup
 * del mapa. Mismo layout de cards que "Casos reportados" en Inicio, para que
 * se sienta la misma experiencia en vez de un modal aparte.
 */
export function ComunidadDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [comunidad, setComunidad] = useState<Comunidad | null>(
    (location.state as { comunidad?: Comunidad } | null)?.comunidad ?? null,
  );
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!id) return;

    // Si se llegó por navegación desde el mapa ya tenemos la comunidad en el
    // state; si se entró por URL directa (o al recargar) hay que buscarla.
    if (!comunidad) {
      listarComunidades()
        .then((lista) => setComunidad(lista.find((c) => c.id === id) ?? null))
        .catch(() => setError('No se pudo cargar esta comunidad.'));
    }

    listarMascotasDeComunidad(id, 1, TAMANO_PAGINA)
      .then((resp) => {
        setMascotas(resp.items);
        setTotal(resp.total);
        setPagina(1);
      })
      .catch(() => setError('No se pudieron cargar las mascotas de esta comunidad.'))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargarMas() {
    if (!id) return;
    setCargandoMas(true);
    try {
      const resp = await listarMascotasDeComunidad(id, pagina + 1, TAMANO_PAGINA);
      setMascotas((prev) => [...prev, ...resp.items]);
      setTotal(resp.total);
      setPagina((p) => p + 1);
    } catch {
      setError('No se pudieron cargar más mascotas.');
    } finally {
      setCargandoMas(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-paper">
      <div className="sticky top-0 z-[1] border-b-2 border-line bg-paper-raised px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="u-data mb-2 inline-flex items-center gap-1 text-ink-soft transition-colors hover:text-brand-700"
        >
          <ChevronIcon className="h-3 w-3 rotate-90" />
          Volver al mapa
        </button>

        <p className="u-eyebrow text-ink-faint">Comunidad</p>
        <h1 className="u-title-page mt-1">{comunidad?.nombre ?? 'Cargando...'}</h1>
        {comunidad?.descripcion && (
          <p className="u-body mt-1 text-ink-soft">{comunidad.descripcion}</p>
        )}

        <p className="u-title-section mt-2 text-brand-700">
          {cargando ? '—' : mascotas.length}
          <span className="u-data ml-1 text-[11px] text-ink-faint">
            / {total} {total === 1 ? 'mascota registrada' : 'mascotas registradas'}
          </span>
        </p>
      </div>

      <div className="flex-1 space-y-10 p-4 sm:p-6">
        {cargando && <p className="u-body text-ink-soft">Cargando mascotas...</p>}
        {error && <p className="u-body text-brand-700">{error}</p>}

        {!cargando && !error && mascotas.length === 0 && (
          <div className="border border-dashed border-line-strong p-8 text-center">
            <PawIcon className="mx-auto h-8 w-8 text-line-strong" />
            <p className="u-body mt-2 text-ink-soft">
              Todavía no hay mascotas registradas en esta comunidad.
            </p>
          </div>
        )}

        {mascotas.map((mascota) => (
          <MascotaCard key={mascota.id} mascota={mascota} />
        ))}

        {!cargando && mascotas.length < total && (
          <button
            type="button"
            onClick={cargarMas}
            disabled={cargandoMas}
            className="u-data w-full border border-line-strong py-2.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {cargandoMas ? 'Cargando...' : `Cargar más (${mascotas.length} de ${total})`}
          </button>
        )}
      </div>
    </div>
  );
}
