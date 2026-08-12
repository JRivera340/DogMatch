import { useEffect, useMemo, useState } from 'react';
import { MapaMascotas } from '../components/MapaMascotas';
import { MascotaCard } from '../components/MascotaCard';
import { listarMascotas } from '../api';
import type { Especie, Mascota } from '../types';

type FiltroEspecie = 'Todas' | Especie;
type FiltroGenero = 'Todos' | 'Macho' | 'Hembra';

const selectClass =
  'u-data border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none';

export function Inicio() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEspecie, setFiltroEspecie] = useState<FiltroEspecie>('Todas');
  const [filtroGenero, setFiltroGenero] = useState<FiltroGenero>('Todos');
  const [filtroColor, setFiltroColor] = useState<string>('Todos');

  useEffect(() => {
    listarMascotas()
      .then(setMascotas)
      .catch(() => setError('No se pudieron cargar las mascotas.'))
      .finally(() => setCargando(false));
  }, []);

  function handleEncontrada(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  const coloresDisponibles = useMemo(
    () => Array.from(new Set(mascotas.map((m) => m.color))).sort((a, b) => a.localeCompare(b)),
    [mascotas],
  );

  const mascotasFiltradas = mascotas.filter((m) => {
    if (filtroEspecie !== 'Todas' && m.especie !== filtroEspecie) return false;
    if (filtroGenero !== 'Todos' && m.genero !== filtroGenero) return false;
    if (filtroColor !== 'Todos' && m.color !== filtroColor) return false;
    return true;
  });

  const hayFiltrosActivos =
    filtroEspecie !== 'Todas' || filtroGenero !== 'Todos' || filtroColor !== 'Todos';

  function limpiarFiltros() {
    setFiltroEspecie('Todas');
    setFiltroGenero('Todos');
    setFiltroColor('Todos');
  }

  return (
    <div className="flex w-full flex-col md:flex-row">
      <div className="relative h-72 shrink-0 border-b-2 border-brand-700 md:h-full md:w-3/5 md:border-r-2 md:border-b-0">
        <MapaMascotas mascotas={mascotasFiltradas} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto bg-paper">
        <div className="sticky top-0 z-[1] border-b-2 border-line bg-paper-raised">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="u-eyebrow text-ink-faint">Casos activos</p>
              <p className="u-title-section text-brand-700">
                {cargando ? '—' : mascotasFiltradas.length}
                {!cargando && hayFiltrosActivos && (
                  <span className="u-data ml-1 text-ink-faint">/ {mascotas.length}</span>
                )}
              </p>
            </div>
            <span className="u-data border border-brand-600 bg-brand-50 px-3 py-1 text-brand-700">
              En tiempo real
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
            <label className="u-label" htmlFor="filtro-especie">
              Filtrar
            </label>
            <select
              id="filtro-especie"
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value as FiltroEspecie)}
              className={selectClass}
            >
              <option value="Todas">Especie: todas</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
            </select>

            <select
              value={filtroGenero}
              onChange={(e) => setFiltroGenero(e.target.value as FiltroGenero)}
              className={selectClass}
            >
              <option value="Todos">Género: todos</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>

            <select
              value={filtroColor}
              onChange={(e) => setFiltroColor(e.target.value)}
              className={selectClass}
            >
              <option value="Todos">Color: todos</option>
              {coloresDisponibles.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="u-data text-brand-700 underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 p-4">
          {cargando && <p className="u-body text-ink-soft">Cargando reportes...</p>}
          {error && <p className="u-body text-brand-700">{error}</p>}
          {mascotasFiltradas.map((mascota) => (
            <MascotaCard key={mascota.id} mascota={mascota} onEncontrada={handleEncontrada} />
          ))}
          {!cargando && mascotas.length === 0 && !error && (
            <div className="border border-dashed border-line-strong p-6 text-center">
              <p className="u-body text-ink-soft">
                Aún no hay mascotas reportadas. Sé el primero en publicar un caso.
              </p>
            </div>
          )}
          {!cargando && mascotas.length > 0 && mascotasFiltradas.length === 0 && (
            <div className="border border-dashed border-line-strong p-6 text-center">
              <p className="u-body text-ink-soft">Ningún caso coincide con estos filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
