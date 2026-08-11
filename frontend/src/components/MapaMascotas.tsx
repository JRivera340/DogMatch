import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { Mascota } from '../types';

const iconoMascota = L.divIcon({
  className: '',
  html: `<div style="position:relative"><div style="background:#c81e3a;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];

interface Props {
  mascotas: Mascota[];
  onSeleccionar?: (mascota: Mascota) => void;
}

export function MapaMascotas({ mascotas, onSeleccionar }: Props) {
  return (
    <MapContainer center={CENTRO_COLOMBIA} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
  );
}
