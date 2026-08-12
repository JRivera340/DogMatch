import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import type { Mascota } from '../types';
import type { Ciudad } from '../data/ciudades';
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
  useInvalidarMapaAlRedimensionar(map);

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

      <MapaLeyenda
        className="bottom-2 left-2"
        items={[
          { color: COLOR_PENDIENTE, etiqueta: 'Sin validar' },
          { color: COLOR_APROBADA, etiqueta: 'Verificada' },
        ]}
      />
    </div>
  );
}
