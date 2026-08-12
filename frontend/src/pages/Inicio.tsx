import { useEffect, useMemo, useState } from 'react';
import { MapaMascotas } from '../components/MapaMascotas';
import { MascotaCard } from '../components/MascotaCard';
import { listarMascotas } from '../api';
import type { Especie, Mascota } from '../types';
import { CIUDADES_COLOMBIA, centroDepartamento, DEPARTAMENTOS_COLOMBIA } from '../data/ciudades';
import { distanciaKm } from '../utils/geo';
import { PawIcon, SearchOffIcon } from '../components/icons';

type FiltroEspecie = 'Todas' | Especie;
type FiltroGenero = 'Todos' | 'Macho' | 'Hembra';
type FiltroEstado = 'Todas' | 'perdida' | 'encontrada';

// Radio aproximado del área metropolitana usado para "pertenece a esta ciudad"
const RADIO_CIUDAD_KM = 25;

const selectClass =
  'u-data border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none';

const TAMANO_PAGINA = 50;

export function Inicio() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  const [filtroEspecie, setFiltroEspecie] = useState<FiltroEspecie>('Todas');
  const [filtroGenero, setFiltroGenero] = useState<FiltroGenero>('Todos');
  const [filtroColor, setFiltroColor] = useState<string>('Todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('Todas');
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todas');

  useEffect(() => {
    listarMascotas(1, TAMANO_PAGINA)
      .then((resp) => {
        setMascotas(resp.items);
        setTotal(resp.total);
        setPagina(1);
      })
      .catch(() => setError('No se pudieron cargar las mascotas.'))
      .finally(() => setCargando(false));
  }, []);

  async function cargarMas() {
    setCargandoMas(true);
    try {
      const resp = await listarMascotas(pagina + 1, TAMANO_PAGINA);
      setMascotas((prev) => [...prev, ...resp.items]);
      setTotal(resp.total);
      setPagina((p) => p + 1);
    } catch {
      setError('No se pudieron cargar más casos.');
    } finally {
      setCargandoMas(false);
    }
  }

  function handleEncontrada(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  const coloresDisponibles = useMemo(
    () => Array.from(new Set(mascotas.map((m) => m.color))).sort((a, b) => a.localeCompare(b)),
    [mascotas],
  );

  const ciudadSeleccionada = CIUDADES_COLOMBIA.find((c) => c.nombre === filtroCiudad) ?? null;
  const ciudadesDelDepartamento =
    filtroDepartamento !== 'Todos'
      ? CIUDADES_COLOMBIA.filter((c) => c.departamento === filtroDepartamento)
      : [];
  // Si hay ciudad puntual, esa manda; si solo hay departamento, el mapa se va al centro de ese departamento.
  const objetivoMapa =
    ciudadSeleccionada ??
    (filtroDepartamento !== 'Todos' ? centroDepartamento(filtroDepartamento) : null);

  const mascotasFiltradas = mascotas.filter((m) => {
    if (filtroEstado !== 'Todas' && m.estado !== filtroEstado) return false;
    if (filtroEspecie !== 'Todas' && m.especie !== filtroEspecie) return false;
    if (filtroGenero !== 'Todos' && m.genero !== filtroGenero) return false;
    if (filtroColor !== 'Todos' && m.color !== filtroColor) return false;
    if (ciudadSeleccionada) {
      const distancia = distanciaKm(m.lat, m.lng, ciudadSeleccionada.lat, ciudadSeleccionada.lng);
      if (distancia > RADIO_CIUDAD_KM) return false;
    }
    if (filtroDepartamento !== 'Todos') {
      const perteneceAlDepartamento = ciudadesDelDepartamento.some(
        (c) => distanciaKm(m.lat, m.lng, c.lat, c.lng) <= RADIO_CIUDAD_KM,
      );
      if (!perteneceAlDepartamento) return false;
    }
    return true;
  });

  const hayFiltrosActivos =
    filtroEstado !== 'Todas' ||
    filtroEspecie !== 'Todas' ||
    filtroGenero !== 'Todos' ||
    filtroColor !== 'Todos' ||
    filtroCiudad !== 'Todas' ||
    filtroDepartamento !== 'Todos';

  function limpiarFiltros() {
    setFiltroEstado('Todas');
    setFiltroEspecie('Todas');
    setFiltroGenero('Todos');
    setFiltroColor('Todos');
    setFiltroCiudad('Todas');
    setFiltroDepartamento('Todos');
  }

  return (
    <div className="flex w-full flex-col md:flex-row">
      <div className="relative h-72 shrink-0 border-b-2 border-brand-700 md:h-full md:w-3/5 md:border-r-2 md:border-b-0">
        <MapaMascotas mascotas={mascotasFiltradas} ciudadFiltro={objetivoMapa} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto bg-paper">
        <div className="sticky top-0 z-[1] border-b-2 border-line bg-paper-raised">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="u-eyebrow text-ink-faint">Casos reportados</p>
              <p className="u-title-section text-brand-700">
                {cargando ? '—' : mascotasFiltradas.length}
                {!cargando && (
                  <span className="u-data ml-1 text-ink-faint">
                    / {total} {hayFiltrosActivos ? '(filtrado)' : ''}
                  </span>
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
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className={selectClass}
            >
              <option value="Todas">Estado: todos</option>
              <option value="perdida">Perdida</option>
              <option value="encontrada">Encontrada</option>
            </select>

            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className={selectClass}
            >
              <option value="Todos">Departamento: todos</option>
              {DEPARTAMENTOS_COLOMBIA.map((departamento) => (
                <option key={departamento} value={departamento}>
                  {departamento}
                </option>
              ))}
            </select>

            <select
              value={filtroCiudad}
              onChange={(e) => setFiltroCiudad(e.target.value)}
              className={selectClass}
            >
              <option value="Todas">Ciudad: todas</option>
              {CIUDADES_COLOMBIA.map((ciudad) => (
                <option key={ciudad.nombre} value={ciudad.nombre}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>

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
            <div className="border border-dashed border-line-strong p-8 text-center">
              <PawIcon className="mx-auto h-8 w-8 text-line-strong" />
              <p className="u-body mt-2 text-ink-soft">
                Aún no hay mascotas reportadas. Sé el primero en publicar un caso.
              </p>
            </div>
          )}
          {!cargando && mascotas.length > 0 && mascotasFiltradas.length === 0 && (
            <div className="border border-dashed border-line-strong p-8 text-center">
              <SearchOffIcon className="mx-auto h-8 w-8 text-line-strong" />
              <p className="u-body mt-2 text-ink-soft">Ningún caso coincide con estos filtros.</p>
            </div>
          )}
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
    </div>
  );
}
