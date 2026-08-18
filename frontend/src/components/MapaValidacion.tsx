import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import type { Comunidad, Mascota } from '../types';
import type { Ciudad } from '../data/ciudades';
import { listarComunidades } from '../api';
import { obtenerTokenAdmin } from '../adminAuth';
import { ComunidadMarcador } from './ComunidadMarcador';
import { FormCrearComunidad } from './FormCrearComunidad';
import { MapaLeyenda } from './MapaLeyenda';
import { useInvalidarMapaAlRedimensionar } from '../utils/useInvalidarMapa';

const COLOR_PENDIENTE = '#c81e3a';
const COLOR_APROBADA = '#4b7040';

function crearIcono(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative"><div style="background:${color};width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

const iconoPendiente = crearIcono(COLOR_PENDIENTE);
const iconoAprobada = crearIcono(COLOR_APROBADA);

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];
const ZOOM_COLOMBIA = 5;

interface Props {
  mascotas: Mascota[];
  onVerDetalle: (mascota: Mascota) => void;
  /** Departamento/ciudad activo del filtro — si se pasa, recentra el mapa en él. */
  ciudadFiltro?: Ciudad | null;
}

function CapturarClickMapa({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function RecentrarEnCiudad({ ciudad }: { ciudad: Ciudad | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (ciudad) {
      map.flyTo([ciudad.lat, ciudad.lng], ciudad.zoom, { duration: 1 });
    } else {
      map.flyTo(CENTRO_COLOMBIA, ZOOM_COLOMBIA, { duration: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudad?.nombre]);

  return null;
}

/**
 * Mapa de moderación: rojo = pendiente de validar, verde = aprobada.
 * Las rechazadas no se muestran aquí (ya no son casos activos a revisar
 * espacialmente, siguen visibles en la tabla del panel). Recibe la lista
 * ya filtrada por el toggle sin validar/validadas del panel — el mapa
 * siempre refleja lo mismo que la tabla.
 */
export function MapaValidacion({ mascotas, onVerDetalle, ciudadFiltro }: Props) {
  const visibles = mascotas.filter((m) => m.validacion !== 'rechazada');
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [colocandoComunidad, setColocandoComunidad] = useState(false);
  const [puntoNuevaComunidad, setPuntoNuevaComunidad] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  useInvalidarMapaAlRedimensionar(map);

  function cargarComunidades() {
    listarComunidades()
      .then(setComunidades)
      .catch(() => {});
  }

  useEffect(cargarComunidades, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={CENTRO_COLOMBIA}
        zoom={ZOOM_COLOMBIA}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecentrarEnCiudad ciudad={ciudadFiltro} />
        {colocandoComunidad && (
          <CapturarClickMapa
            onClick={(lat, lng) => {
              setPuntoNuevaComunidad({ lat, lng });
              setColocandoComunidad(false);
            }}
          />
        )}
        {comunidades.map((comunidad) => (
          <ComunidadMarcador
            key={comunidad.id}
            comunidad={comunidad}
            isAdmin
            adminToken={obtenerTokenAdmin() ?? undefined}
            onCambio={cargarComunidades}
          />
        ))}
        {visibles.map((mascota) => (
          <Marker
            key={mascota.id}
            position={[mascota.lat, mascota.lng]}
            icon={mascota.validacion === 'aprobada' ? iconoAprobada : iconoPendiente}
          >
            <Popup>
              <div className="u-body">
                <p className="u-title-card text-[1rem]">{mascota.nombre}</p>
                <p className="text-ink-soft">{mascota.raza}</p>
                <p className="u-data text-ink-faint">
                  {mascota.validacion === 'aprobada' ? 'Verificado' : 'Sin validar'}
                </p>
                <button
                  type="button"
                  onClick={() => onVerDetalle(mascota)}
                  className="u-data mt-2 border border-brand-600 px-2 py-1 text-brand-700 hover:bg-brand-50"
                >
                  Ver detalle
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-2 right-2 z-[500]">
        {colocandoComunidad ? (
          <button
            type="button"
            onClick={() => setColocandoComunidad(false)}
            className="u-data border-2 border-brand-700 bg-brand-600 px-2.5 py-1.5 font-semibold text-white shadow-[2px_2px_0_rgba(74,14,23,0.35)]"
          >
            Clic en el mapa para ubicarla... (cancelar)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setColocandoComunidad(true)}
            className="u-data border border-line-strong bg-paper-raised px-2.5 py-1.5 text-ink-soft shadow-[2px_2px_0_rgba(34,29,26,0.15)] hover:border-brand-600 hover:text-brand-700"
          >
            + Agregar comunidad
          </button>
        )}
      </div>

      <MapaLeyenda
        className="bottom-2 left-2"
        items={[
          { color: COLOR_PENDIENTE, etiqueta: 'Sin validar' },
          { color: COLOR_APROBADA, etiqueta: 'Verificada' },
          { color: '#6b4c9a', etiqueta: 'Comunidad', emoji: '🏘️' },
        ]}
      />

      {puntoNuevaComunidad &&
        (() => {
          const token = obtenerTokenAdmin();
          if (!token) return null;
          return (
            <FormCrearComunidad
              lat={puntoNuevaComunidad.lat}
              lng={puntoNuevaComunidad.lng}
              token={token}
              onCreada={() => {
                setPuntoNuevaComunidad(null);
                cargarComunidades();
              }}
              onCancelar={() => setPuntoNuevaComunidad(null)}
            />
          );
        })()}
    </div>
  );
}
