import { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Comunidad } from '../types';
import { adminEliminarComunidad } from '../api';
import { ModalMascotasComunidad } from './ModalMascotasComunidad';
import { ModalAgregarMascotaAComunidad } from './ModalAgregarMascotaAComunidad';

const COLOR_COMUNIDAD = '#6b4c9a';

function crearIconoComunidad() {
  return L.divIcon({
    className: '',
    html: `<div style="background:${COLOR_COMUNIDAD};width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);font-size:14px;line-height:1">🏘️</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

const iconoComunidad = crearIconoComunidad();

interface Props {
  comunidad: Comunidad;
  /** Habilita el botón de eliminar — solo el panel admin lo pasa. */
  isAdmin?: boolean;
  adminToken?: string;
  /** Se llama tras vincular una mascota o eliminar la comunidad, para refrescar la lista del mapa. */
  onCambio: () => void;
}

/**
 * Punto de comunidad en el mapa: ver/agregar mascotas son acciones públicas
 * (mismo criterio que reportar un caso); eliminar el punto es solo admin.
 */
export function ComunidadMarcador({ comunidad, isAdmin, adminToken, onCambio }: Props) {
  const [modalVer, setModalVer] = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    if (!adminToken) return;
    setEliminando(true);
    setError(null);
    try {
      await adminEliminarComunidad(comunidad.id, adminToken);
      onCambio();
    } catch {
      setError('No se pudo eliminar la comunidad.');
      setEliminando(false);
    }
  }

  return (
    <>
      <Marker position={[comunidad.lat, comunidad.lng]} icon={iconoComunidad}>
        <Popup>
          <div className="u-body min-w-[190px]">
            <p className="u-title-card text-[1rem]">{comunidad.nombre}</p>
            {comunidad.descripcion && <p className="text-ink-soft">{comunidad.descripcion}</p>}
            <p className="u-data text-ink-faint">
              {comunidad.cantidadMascotas} {comunidad.cantidadMascotas === 1 ? 'mascota' : 'mascotas'}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setModalVer(true)}
                className="u-data border border-brand-600 px-2 py-1 text-brand-700 hover:bg-brand-50"
              >
                Ver mascotas
              </button>
              <button
                type="button"
                onClick={() => setModalAgregar(true)}
                className="u-data border border-brand-600 px-2 py-1 text-brand-700 hover:bg-brand-50"
              >
                Agregar mascota
              </button>
            </div>

            {isAdmin &&
              (confirmandoEliminar ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={eliminar}
                    disabled={eliminando}
                    className="u-data border border-brand-700 bg-brand-700 px-2 py-1 text-white disabled:opacity-50"
                  >
                    {eliminando ? 'Eliminando...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoEliminar(false)}
                    className="u-data border border-line-strong px-2 py-1 text-ink-soft"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar(true)}
                  className="u-data mt-1.5 block border border-line-strong px-2 py-1 text-ink-soft hover:border-brand-600 hover:text-brand-700"
                >
                  Eliminar comunidad
                </button>
              ))}

            {error && <p className="u-data mt-1.5 text-brand-700">{error}</p>}
          </div>
        </Popup>
      </Marker>

      {modalVer && <ModalMascotasComunidad comunidad={comunidad} onClose={() => setModalVer(false)} />}
      {modalAgregar && (
        <ModalAgregarMascotaAComunidad
          comunidad={comunidad}
          onClose={() => setModalAgregar(false)}
          onVinculada={onCambio}
        />
      )}
    </>
  );
}
