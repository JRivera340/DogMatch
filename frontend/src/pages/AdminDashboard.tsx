import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminActualizarEstado, adminEliminarMascota, adminListarMascotas } from '../api';
import { limpiarTokenAdmin, obtenerTokenAdmin } from '../adminAuth';
import type { Mascota } from '../types';

type FiltroEstado = 'todas' | 'perdida' | 'encontrada';

function codigoCaso(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' });
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>('todas');
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

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
      const datos = await adminListarMascotas(token);
      setMascotas(datos);
    } catch (e) {
      if (e instanceof Error && e.message.includes('401')) {
        cerrarSesionYRedirigir();
        return;
      }
      setError('No se pudieron cargar los casos.');
    } finally {
      setCargando(false);
    }
  }

  async function eliminar(id: string) {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    setProcesandoId(id);
    try {
      await adminEliminarMascota(id, token);
      setMascotas((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError('No se pudo eliminar el caso.');
    } finally {
      setProcesandoId(null);
      setConfirmandoId(null);
    }
  }

  async function alternarEstado(mascota: Mascota) {
    const token = obtenerTokenAdmin();
    if (!token) return cerrarSesionYRedirigir();
    const nuevoEstado = mascota.estado === 'perdida' ? 'encontrada' : 'perdida';
    setProcesandoId(mascota.id);
    try {
      await adminActualizarEstado(mascota.id, nuevoEstado, token);
      setMascotas((prev) =>
        prev.map((m) => (m.id === mascota.id ? { ...m, estado: nuevoEstado } : m)),
      );
    } catch {
      setError('No se pudo actualizar el estado.');
    } finally {
      setProcesandoId(null);
    }
  }

  const mascotasFiltradas = mascotas.filter((m) => filtro === 'todas' || m.estado === filtro);

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="u-eyebrow">Panel administrativo</p>
          <h1 className="u-title-page mt-1">Todos los casos</h1>
        </div>
        <button
          type="button"
          onClick={cerrarSesionYRedirigir}
          className="u-data border border-line-strong px-3 py-1.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mt-5 flex gap-1.5">
        {(['todas', 'perdida', 'encontrada'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => setFiltro(opcion)}
            className={`u-data border px-3 py-1.5 capitalize transition-colors ${
              filtro === opcion
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line-strong text-ink-soft hover:border-brand-600 hover:text-brand-700'
            }`}
          >
            {opcion}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-[13px] font-medium text-brand-700">{error}</p>}
      {cargando && <p className="u-body mt-4 text-ink-soft">Cargando casos...</p>}

      {!cargando && mascotasFiltradas.length === 0 && (
        <div className="mt-4 border border-dashed border-line-strong p-6 text-center">
          <p className="u-body text-ink-soft">No hay casos con este filtro.</p>
        </div>
      )}

      {!cargando && mascotasFiltradas.length > 0 && (
        <div className="mt-4 overflow-x-auto border border-line bg-paper-raised">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b-2 border-line text-left">
                <th className="u-label px-3 py-2.5">Foto</th>
                <th className="u-label px-3 py-2.5">Nombre</th>
                <th className="u-label px-3 py-2.5">Estado</th>
                <th className="u-label px-3 py-2.5">Código</th>
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
                  <td className="u-body px-3 py-2.5 font-semibold">{mascota.nombre}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`u-data border px-2 py-0.5 ${
                        mascota.estado === 'perdida'
                          ? 'border-brand-600 text-brand-700'
                          : 'border-moss-600 text-moss-700'
                      }`}
                    >
                      {mascota.estado}
                    </span>
                  </td>
                  <td className="u-data px-3 py-2.5 text-ink-faint">
                    #{codigoCaso(mascota.id)}
                  </td>
                  <td className="u-data px-3 py-2.5 text-ink-soft">
                    {formatearFecha(mascota.createdAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => alternarEstado(mascota)}
                        disabled={procesandoId === mascota.id}
                        className="u-data border border-line-strong px-2 py-1 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
                      >
                        Marcar {mascota.estado === 'perdida' ? 'encontrada' : 'perdida'}
                      </button>

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
        </div>
      )}
    </div>
  );
}
