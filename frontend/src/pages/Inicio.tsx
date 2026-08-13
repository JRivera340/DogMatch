import { useEffect, useMemo, useState } from 'react';
import { MapaMascotas } from '../components/MapaMascotas';
import { MascotaCard } from '../components/MascotaCard';
import { listarMascotas } from '../api';
import type { Especie, Mascota, TipoReporte } from '../types';
import {
  TODAS_LAS_CIUDADES,
  CIUDADES_AFECTADAS,
  centroDepartamento,
  DEPARTAMENTOS_AFECTADOS,
} from '../data/ciudades';
import { distanciaKm } from '../utils/geo';
import { ChevronIcon, FilterIcon, PawIcon, SearchOffIcon } from '../components/icons';

type FiltroEspecie = 'Todas' | Especie;
type FiltroGenero = 'Todos' | 'Macho' | 'Hembra';
// 'perdida'/'rescatada' filtran por tipoReporte (casos activos); 'encontrada' filtra por
// estado, sin importar el tipo — son las que ya están de vuelta con su familia.
type FiltroTipo = 'Todas' | TipoReporte | 'encontrada';

// Radio aproximado del área metropolitana usado para "pertenece a esta ciudad"
const RADIO_CIUDAD_KM = 25;
// Debajo de este ancho se usa el layout mobile (mapa de fondo + panel deslizable).
const BREAKPOINT_MOBILE = 768;

const selectClass =
  'u-data shrink-0 border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none';
const selectClassApilado =
  'u-body w-full border border-line-strong bg-paper-raised px-3 py-2.5 text-ink focus:border-brand-600 focus:outline-none';

const TAMANO_PAGINA = 50;

/** true por debajo del breakpoint mobile — se recalcula en cambios de tamaño/orientación. */
function useEsMobile() {
  const [esMobile, setEsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < BREAKPOINT_MOBILE,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE - 1}px)`);
    const actualizar = () => setEsMobile(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  return esMobile;
}

export function Inicio() {
  const esMobile = useEsMobile();
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
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('Todas');

  // Solo mobile: panel de casos colapsado por defecto (el mapa ocupa toda la pantalla),
  // y modal aparte para los filtros (no caben cómodos en una barra angosta).
  const [listaAbierta, setListaAbierta] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

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
      setMascotas((prev) => {
        // Si la página no trae nada nuevo (ya se habían cargado todos, aunque el
        // contador dijera lo contrario), el total se autocorrige al tamaño real
        // para que el botón desaparezca en vez de quedar pegado sin hacer nada.
        if (resp.items.length === 0) {
          setTotal(prev.length);
          return prev;
        }
        setTotal(resp.total);
        return [...prev, ...resp.items];
      });
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

  // Si hay un departamento elegido, el select de ciudad solo ofrece sus municipios.
  const ciudadesDisponibles =
    filtroDepartamento === 'Todos'
      ? CIUDADES_AFECTADAS
      : CIUDADES_AFECTADAS.filter((c) => c.departamento === filtroDepartamento);

  function elegirDepartamento(valor: string) {
    setFiltroDepartamento(valor);
    // La ciudad elegida puede no pertenecer al nuevo departamento — se limpia.
    setFiltroCiudad('Todas');
  }

  const ciudadSeleccionada = TODAS_LAS_CIUDADES.find((c) => c.nombre === filtroCiudad) ?? null;
  const ciudadesDelDepartamento =
    filtroDepartamento !== 'Todos'
      ? TODAS_LAS_CIUDADES.filter((c) => c.departamento === filtroDepartamento)
      : [];
  // Si hay ciudad puntual, esa manda; si solo hay departamento, el mapa se va al centro de ese departamento.
  const objetivoMapa =
    ciudadSeleccionada ??
    (filtroDepartamento !== 'Todos' ? centroDepartamento(filtroDepartamento) : null);

  const mascotasFiltradas = mascotas.filter((m) => {
    if (filtroTipo === 'encontrada') {
      if (m.estado !== 'encontrada') return false;
    } else if (filtroTipo !== 'Todas') {
      if (m.estado === 'encontrada') return false;
      if (m.tipoReporte !== filtroTipo) return false;
    }
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

  const cantidadFiltrosActivos = [
    filtroTipo !== 'Todas',
    filtroEspecie !== 'Todas',
    filtroGenero !== 'Todos',
    filtroColor !== 'Todos',
    filtroCiudad !== 'Todas',
    filtroDepartamento !== 'Todos',
  ].filter(Boolean).length;
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  function limpiarFiltros() {
    setFiltroTipo('Todas');
    setFiltroEspecie('Todas');
    setFiltroGenero('Todos');
    setFiltroColor('Todos');
    setFiltroCiudad('Todas');
    setFiltroDepartamento('Todos');
  }

  const listaCasos = (
    <>
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
    </>
  );

  if (esMobile) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0">
          <MapaMascotas
            mascotas={mascotasFiltradas}
            ciudadFiltro={objetivoMapa}
            zoomControl={false}
            leyendaClassName="bottom-16 left-2"
          />
        </div>

        {/* Solo el contador flota sobre el mapa, en la esquina izquierda: la derecha
            la ocupa el buscador de ciudad (BuscadorCiudad), y el zoom +/- de Leaflet
            va apagado en mobile (se usa pellizco) para no competir con nada de esto. */}
        <div className="pointer-events-none absolute top-2 left-2 z-[550]">
          <div className="pointer-events-auto border border-line bg-paper-raised/95 px-3 py-1.5 shadow-[2px_2px_0_rgba(34,29,26,0.15)]">
            <p className="u-eyebrow text-[9px] text-ink-faint">Casos</p>
            <p className="u-title-section text-base text-brand-700">
              {cargando ? '—' : mascotasFiltradas.length}
              <span className="u-data ml-1 text-[10px] text-ink-faint">/ {total}</span>
            </p>
          </div>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 z-[1010] flex flex-col border-t-2 border-brand-700 bg-paper-raised shadow-[0_-4px_16px_rgba(34,29,26,0.25)] transition-[height] duration-300 ease-out ${
            listaAbierta ? 'h-[70vh]' : 'h-14'
          }`}
        >
          {/* Filtros/Limpiar viven en esta barra a propósito: sube y baja pegada
              al panel en vez de flotar aparte sobre el mapa. */}
          <div className="flex shrink-0 items-center justify-between gap-2 pr-2 pl-3">
            <button
              type="button"
              onClick={() => setListaAbierta((v) => !v)}
              aria-expanded={listaAbierta}
              className="flex flex-1 items-center gap-2 py-2.5"
            >
              <ChevronIcon
                className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 ${listaAbierta ? 'rotate-180' : ''}`}
              />
              <span className="u-label">
                Casos reportados ({cargando ? '—' : mascotasFiltradas.length})
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(true)}
                className="u-data flex items-center gap-1.5 border-2 border-brand-700 bg-brand-600 px-2.5 py-1.5 font-semibold text-white shadow-[2px_2px_0_rgba(74,14,23,0.35)]"
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filtros{hayFiltrosActivos ? ` (${cantidadFiltrosActivos})` : ''}
              </button>
              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="u-data border border-line-strong px-2.5 py-1.5 text-brand-700"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-10 overflow-y-auto border-t border-line px-4 py-3">{listaCasos}</div>
        </div>

        {filtrosAbiertos && (
          <div className="fixed inset-0 z-[1050]">
            <div
              className="absolute inset-0 bg-ink/50"
              onClick={() => setFiltrosAbiertos(false)}
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col border-t-2 border-brand-700 bg-paper-raised">
              <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
                <p className="u-label">Filtrar casos</p>
                <button
                  type="button"
                  onClick={() => setFiltrosAbiertos(false)}
                  className="u-data border border-line-strong px-2.5 py-1 text-ink-soft"
                >
                  Cerrar
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto p-4">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
                  className={selectClassApilado}
                >
                  <option value="Todas">Tipo: todos</option>
                  <option value="perdida">Perdida (con dueño)</option>
                  <option value="rescatada">Busca su dueño</option>
                  <option value="encontrada">Está con su familia</option>
                </select>

                <select
                  value={filtroDepartamento}
                  onChange={(e) => elegirDepartamento(e.target.value)}
                  className={selectClassApilado}
                >
                  <option value="Todos">Departamento: todos</option>
                  {DEPARTAMENTOS_AFECTADOS.map((departamento) => (
                    <option key={departamento} value={departamento}>
                      {departamento}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroCiudad}
                  onChange={(e) => setFiltroCiudad(e.target.value)}
                  className={selectClassApilado}
                >
                  <option value="Todas">Municipio: todos</option>
                  {ciudadesDisponibles.map((ciudad) => (
                    <option key={ciudad.nombre} value={ciudad.nombre}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroEspecie}
                  onChange={(e) => setFiltroEspecie(e.target.value as FiltroEspecie)}
                  className={selectClassApilado}
                >
                  <option value="Todas">Especie: todas</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                </select>

                <select
                  value={filtroGenero}
                  onChange={(e) => setFiltroGenero(e.target.value as FiltroGenero)}
                  className={selectClassApilado}
                >
                  <option value="Todos">Género: todos</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>

                <select
                  value={filtroColor}
                  onChange={(e) => setFiltroColor(e.target.value)}
                  className={selectClassApilado}
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
                    className="u-data w-full border border-line-strong py-2.5 text-brand-700"
                  >
                    Limpiar filtros
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFiltrosAbiertos(false)}
                  className="w-full border-2 border-brand-600 bg-brand-600 py-2.5 text-sm font-semibold text-white"
                >
                  Ver {mascotasFiltradas.length} casos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-row">
      <div className="relative h-full w-3/5 shrink-0 border-r-2 border-brand-700">
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
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
              className={selectClass}
            >
              <option value="Todas">Tipo: todos</option>
              <option value="perdida">Perdida (con dueño)</option>
              <option value="rescatada">Busca su dueño</option>
              <option value="encontrada">Está con su familia</option>
            </select>

            <select
              value={filtroDepartamento}
              onChange={(e) => elegirDepartamento(e.target.value)}
              className={selectClass}
            >
              <option value="Todos">Departamento: todos</option>
              {DEPARTAMENTOS_AFECTADOS.map((departamento) => (
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
              <option value="Todas">Municipio: todos</option>
              {ciudadesDisponibles.map((ciudad) => (
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

        <div className="flex-1 space-y-10 p-4">{listaCasos}</div>
      </div>
    </div>
  );
}
