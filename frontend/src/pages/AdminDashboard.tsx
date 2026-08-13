import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  adminActualizarTipo,
  adminActualizarValidacion,
  adminEliminarMascota,
  adminListarMascotas,
} from '../api';
import { limpiarTokenAdmin, obtenerTokenAdmin } from '../adminAuth';
import type { Mascota, TipoReporte, Validacion } from '../types';
import { MapaValidacion } from '../components/MapaValidacion';
import { DetalleMascotaModal } from '../components/DetalleMascotaModal';
import { codigoCaso, etiquetaEstado, formatearFecha } from '../utils/mascotaFormato';
import { useAlturaDisponible } from '../utils/useAlturaDisponible';
import {
  TODAS_LAS_CIUDADES,
  CIUDADES_AFECTADAS,
  centroDepartamento,
  DEPARTAMENTOS_AFECTADOS,
} from '../data/ciudades';
import { distanciaKm } from '../utils/geo';

const RADIO_CIUDAD_KM = 25;

// 'perdida'/'rescatada' filtran por tipoReporte (casos activos); 'encontrada' filtra por
// estado, sin importar el tipo — son las que ya están de vuelta con su familia.
type FiltroTipo = 'todas' | TipoReporte | 'encontrada';
type FiltroValidacion = 'pendiente' | 'aprobada' | null;
type Pestana = 'mapa' | 'validacion';

const TAMANO_PAGINA = 100;

export function AdminDashboard() {
  const navigate = useNavigate();
  const [pestana, setPestana] = useState<Pestana>('mapa');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todas');
  const [filtroValidacion, setFiltroValidacion] = useState<FiltroValidacion>(null);
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('Todos');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('Todas');
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  useEffect(() => {
    const token = obtenerTokenAdmin();
    if (!token) {
      navigate('/admin');
      return;
    }
    cargar(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cerrarSesionYRedirigir() {
    limpiarTokenAdmin();
    navigate('/admin');
  }

  async function cargar(token: string) {
    setCargando(true);
    setError(null);
    try {
      const resp = await adminListarMascotas(token, 1, TAMANO_PAGINA);
      setMascotas(resp.items);
      setTotal(resp.total);
      setPagina(1);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        cerrarSesionYRedirigir();
        return;
      }
      setError('No se pudieron cargar los casos.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarMas() {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    setCargandoMas(true);
    try {
      const resp = await adminListarMascotas(token, pagina + 1, TAMANO_PAGINA);
      setMascotas((prev) => [...prev, ...resp.items]);
      setTotal(resp.total);
      setPagina((p) => p + 1);
    } catch {
      setError('No se pudieron cargar más casos.');
    } finally {
      setCargandoMas(false);
    }
  }

  async function eliminar(id: string) {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    setProcesandoId(id);
    try {
      await adminEliminarMascota(id, token);
      setMascotas((prev) => prev.filter((m) => m.id !== id));
      setTotal((t) => t - 1);
    } catch {
      setError('No se pudo eliminar el caso.');
    } finally {
      setProcesandoId(null);
      setConfirmandoId(null);
    }
  }

  async function cambiarTipo(mascota: Mascota, tipo: TipoReporte | 'encontrada') {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    setProcesandoId(mascota.id);
    try {
      const actualizada = await adminActualizarTipo(mascota.id, tipo, token);
      setMascotas((prev) =>
        prev.map((m) =>
          m.id === mascota.id
            ? { ...m, tipoReporte: actualizada.tipoReporte, estado: actualizada.estado }
            : m,
        ),
      );
    } catch {
      setError('No se pudo actualizar el tipo.');
    } finally {
      setProcesandoId(null);
    }
  }

  async function cambiarValidacion(mascota: Mascota, validacion: Validacion) {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    setProcesandoId(mascota.id);
    try {
      await adminActualizarValidacion(mascota.id, validacion, token);
      setMascotas((prev) => prev.map((m) => (m.id === mascota.id ? { ...m, validacion } : m)));
    } catch {
      setError('No se pudo actualizar la validación.');
    } finally {
      setProcesandoId(null);
    }
  }

  function alternarFiltroValidacion(valor: 'pendiente' | 'aprobada') {
    setFiltroValidacion((actual) => (actual === valor ? null : valor));
  }

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
    } else if (filtroTipo !== 'todas') {
      if (m.estado === 'encontrada') return false;
      if (m.tipoReporte !== filtroTipo) return false;
    }
    if (filtroValidacion && m.validacion !== filtroValidacion) return false;
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

  const pendientesCount = mascotas.filter((m) => m.validacion === 'pendiente').length;
  const aprobadasCount = mascotas.filter((m) => m.validacion === 'aprobada').length;
  const mascotaDetalle = mascotas.find((m) => m.id === detalleId) ?? null;

  const contenidoRef = useRef<HTMLDivElement>(null);
  const altura = useAlturaDisponible(contenidoRef);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b-2 border-line bg-paper-raised">
        <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-4 sm:px-6">
          <div>
            <p className="u-eyebrow">Panel administrativo</p>
            <h1 className="u-title-page mt-1">Reportes</h1>
          </div>
          <button
            type="button"
            onClick={cerrarSesionYRedirigir}
            className="u-data border border-line-strong px-3 py-1.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-4 flex px-4 sm:px-6">
          {(
            [
              { id: 'mapa', etiqueta: 'Mapa' },
              { id: 'validacion', etiqueta: 'Validación' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPestana(tab.id)}
              className={`u-label border-b-2 px-4 py-2.5 transition-colors ${
                pestana === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-faint hover:text-ink-soft'
              }`}
            >
              {tab.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-t border-line px-4 py-2.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-6 [&::-webkit-scrollbar]:hidden">
          <span className="u-label shrink-0">Validación</span>
          <button
            type="button"
            onClick={() => alternarFiltroValidacion('pendiente')}
            aria-pressed={filtroValidacion === 'pendiente'}
            className={`u-data shrink-0 border px-3 py-1.5 transition-colors ${
              filtroValidacion === 'pendiente'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line-strong text-ink-soft hover:border-brand-600 hover:text-brand-700'
            }`}
          >
            Sin validar ({pendientesCount})
          </button>
          <button
            type="button"
            onClick={() => alternarFiltroValidacion('aprobada')}
            aria-pressed={filtroValidacion === 'aprobada'}
            className={`u-data shrink-0 border px-3 py-1.5 transition-colors ${
              filtroValidacion === 'aprobada'
                ? 'border-moss-600 bg-moss-600 text-white'
                : 'border-line-strong text-ink-soft hover:border-moss-600 hover:text-moss-700'
            }`}
          >
            Verificadas ({aprobadasCount})
          </button>

          <span className="u-label ml-4 shrink-0">Tipo</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="u-data shrink-0 border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none"
          >
            <option value="todas">Todos</option>
            <option value="perdida">Perdida (con dueño)</option>
            <option value="rescatada">Busca su dueño</option>
            <option value="encontrada">Está con su familia</option>
          </select>

          <span className="u-label ml-4 shrink-0">Departamento</span>
          <select
            value={filtroDepartamento}
            onChange={(e) => elegirDepartamento(e.target.value)}
            className="u-data shrink-0 border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none"
          >
            <option value="Todos">Todos</option>
            {DEPARTAMENTOS_AFECTADOS.map((departamento) => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </select>

          <span className="u-label ml-4 shrink-0">Municipio</span>
          <select
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
            className="u-data shrink-0 border border-line-strong bg-paper-raised px-2 py-1.5 text-ink focus:border-brand-600 focus:outline-none"
          >
            <option value="Todas">Todos</option>
            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad.nombre} value={ciudad.nombre}>
                {ciudad.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="shrink-0 px-4 pt-3 text-[13px] font-medium text-brand-700 sm:px-6">
          {error}
        </p>
      )}

      <div
        ref={contenidoRef}
        style={altura !== null ? { height: altura } : undefined}
        className="relative"
      >
      {pestana === 'mapa' && (
        <div className="h-full w-full">
          <MapaValidacion
            mascotas={mascotasFiltradas}
            onVerDetalle={(m) => setDetalleId(m.id)}
            ciudadFiltro={objetivoMapa}
          />
        </div>
      )}

      {pestana === 'validacion' && (
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          {cargando && <p className="u-body text-ink-soft">Cargando casos...</p>}

          {!cargando && mascotasFiltradas.length === 0 && (
            <div className="mt-4 border border-dashed border-line-strong p-6 text-center">
              <p className="u-body text-ink-soft">No hay casos con este filtro.</p>
            </div>
          )}

          {!cargando && mascotasFiltradas.length > 0 && (
            <div className="mt-4 overflow-x-auto border border-line bg-paper-raised">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-line text-left">
                    <th className="u-label px-3 py-2.5">Foto</th>
                    <th className="u-label px-3 py-2.5">Nombre</th>
                    <th className="u-label px-3 py-2.5">Tipo</th>
                    <th className="u-label px-3 py-2.5">Validación</th>
                    <th className="u-label px-3 py-2.5">Código</th>
                    <th className="u-label px-3 py-2.5">Vistas</th>
                    <th className="u-label px-3 py-2.5">Fecha</th>
                    <th className="u-label px-3 py-2.5">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mascotasFiltradas.map((mascota) => (
                    <tr key={mascota.id} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-2.5">
                        <img
                          src={mascota.fotoUrl}
                          alt={mascota.nombre}
                          className="h-12 w-12 object-cover"
                        />
                      </td>
                      <td className="u-body px-3 py-2.5">
                        <span className="font-semibold">{mascota.nombre}</span>
                        {mascota.tipoReporte === 'rescatada' && (
                          <span className="u-data mt-0.5 block text-brand-600">Busca su dueño</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`u-data border px-2 py-0.5 ${
                            mascota.estado === 'perdida'
                              ? 'border-brand-600 text-brand-700'
                              : 'border-moss-600 text-moss-700'
                          }`}
                        >
                          {etiquetaEstado(mascota.tipoReporte, mascota.estado, mascota.genero)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`u-data border px-2 py-0.5 ${
                            mascota.validacion === 'aprobada'
                              ? 'border-moss-600 text-moss-700'
                              : mascota.validacion === 'rechazada'
                                ? 'border-ink-faint text-ink-faint'
                                : 'border-brand-600 text-brand-700'
                          }`}
                        >
                          {mascota.validacion === 'aprobada'
                            ? 'Verificado'
                            : mascota.validacion === 'rechazada'
                              ? 'Rechazado'
                              : 'Sin validar'}
                        </span>
                      </td>
                      <td className="u-data px-3 py-2.5 text-ink-faint">
                        #{codigoCaso(mascota.id)}
                      </td>
                      <td className="u-data px-3 py-2.5 text-ink-soft">{mascota.clicks}</td>
                      <td className="u-data px-3 py-2.5 text-ink-soft">
                        {formatearFecha(mascota.createdAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetalleId(mascota.id)}
                            className="u-data border border-brand-600 px-2 py-1 text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            Ver detalle
                          </button>

                          {mascota.validacion !== 'aprobada' && (
                            <button
                              type="button"
                              onClick={() => cambiarValidacion(mascota, 'aprobada')}
                              disabled={procesandoId === mascota.id}
                              className="u-data border border-moss-700 bg-moss-600 px-2 py-1 text-white transition-colors hover:bg-moss-700 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                          )}
                          {mascota.validacion !== 'rechazada' && (
                            <button
                              type="button"
                              onClick={() => cambiarValidacion(mascota, 'rechazada')}
                              disabled={procesandoId === mascota.id}
                              className="u-data border border-brand-700 px-2 py-1 text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          )}

                          <select
                            value={mascota.estado === 'encontrada' ? 'encontrada' : mascota.tipoReporte}
                            onChange={(e) =>
                              cambiarTipo(mascota, e.target.value as TipoReporte | 'encontrada')
                            }
                            disabled={procesandoId === mascota.id}
                            className="u-data border border-line-strong bg-paper-raised px-2 py-1 text-ink-soft focus:border-brand-600 focus:outline-none disabled:opacity-50"
                          >
                            <option value="perdida">Perdido</option>
                            <option value="rescatada">Busca su dueño</option>
                            <option value="encontrada">Está con su familia</option>
                          </select>

                          {confirmandoId === mascota.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => eliminar(mascota.id)}
                                disabled={procesandoId === mascota.id}
                                className="u-data border border-brand-700 bg-brand-700 px-2 py-1 text-white disabled:opacity-50"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmandoId(null)}
                                className="u-data border border-line-strong px-2 py-1 text-ink-soft"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmandoId(mascota.id)}
                              className="u-data border border-brand-600 px-2 py-1 text-brand-700 transition-colors hover:bg-brand-50"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mascotas.length < total && (
                <button
                  type="button"
                  onClick={cargarMas}
                  disabled={cargandoMas}
                  className="u-data w-full border-t border-line py-2.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando...' : `Cargar más (${mascotas.length} de ${total})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      {mascotaDetalle && (
        <DetalleMascotaModal
          mascota={mascotaDetalle}
          onClose={() => setDetalleId(null)}
          admin={{
            onAprobar: () => cambiarValidacion(mascotaDetalle, 'aprobada'),
            onRechazar: () => cambiarValidacion(mascotaDetalle, 'rechazada'),
            procesando: procesandoId === mascotaDetalle.id,
          }}
        />
      )}
    </div>
  );
}
