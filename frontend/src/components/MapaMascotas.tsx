import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { Mascota } from '../types';

const iconoMascota = L.divIcon({
  className: '',
  html: `<div style="background:#c81e3a;width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];

interface Props {
  mascotas: Mascota[];
  onSeleccionar?: (mascota: Mascota) => void;
}

export function MapaMascotas({ mascotas, onSeleccionar }: Props) {
  return (
    <MapContainer center={CENTRO_COLOMBIA} zoom={6} className="h-full w-full">
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
            <div className="text-sm">
              <p className="font-bold">{mascota.nombre}</p>
              <p>{mascota.raza}</p>
              <p className="text-xs text-gray-500">{mascota.ultimaVezLugarTexto}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
