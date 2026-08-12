import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { Mascota } from '../types';

function crearIcono(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative"><div style="background:${color};width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

const iconoPendiente = crearIcono('#c81e3a');
const iconoAprobada = crearIcono('#4b7040');

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];

interface Props {
  mascotas: Mascota[];
}

/**
 * Mapa de moderación: rojo = pendiente de validar, verde = aprobada.
 * Las rechazadas no se muestran aquí (ya no son casos activos a revisar
 * espacialmente, siguen visibles en la tabla del panel).
 */
export function MapaValidacion({ mascotas }: Props) {
  const visibles = mascotas.filter((m) => m.validacion !== 'rechazada');

  return (
    <MapContainer center={CENTRO_COLOMBIA} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
                {mascota.validacion === 'aprobada' ? 'Validado' : 'Sin validar'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
