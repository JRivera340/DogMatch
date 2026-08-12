import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import type { Mascota } from '../types';
import type { Ciudad } from '../data/ciudades';
import { BuscadorCiudad } from './BuscadorCiudad';

const iconoMascota = L.divIcon({
  className: '',
  html: `<div style="position:relative"><div style="background:#c81e3a;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];
const ZOOM_COLOMBIA = 6;

interface Props {
  mascotas: Mascota[];
  onSeleccionar?: (mascota: Mascota) => void;
  /** Ciudad activa del filtro — si se pasa, recentra el mapa en ella (null = vista completa de Colombia). */
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

export function MapaMascotas({ mascotas, onSeleccionar, ciudadFiltro }: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);

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
        {mascotas.map((mascota) => (
          <Marker
            key={mascota.id}
            position={[mascota.lat, mascota.lng]}
            icon={iconoMascota}
            eventHandlers={{ click: () => onSeleccionar?.(mascota) }}
          >
            <Popup>
              <div className="u-body">
                <p className="u-title-card text-[1rem]">{mascota.nombre}</p>
                <p className="text-ink-soft">{mascota.raza}</p>
                <p className="u-data text-ink-faint">{mascota.ultimaVezLugarTexto}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <BuscadorCiudad map={map} ayuda="Solo mueve el mapa — no filtra los casos mostrados" />
    </div>
  );
}
