import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const iconoSeleccion = L.divIcon({
  className: '',
  html: `<div style="background:#dc2626;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];

interface Props {
  lat: number | null;
  lng: number | null;
  onSeleccionar: (lat: number, lng: number) => void;
}

function ClickHandler({ onSeleccionar }: { onSeleccionar: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function SelectorUbicacion({ lat, lng, onSeleccionar }: Props) {
  return (
    <MapContainer
      center={lat && lng ? [lat, lng] : CENTRO_COLOMBIA}
      zoom={lat && lng ? 13 : 6}
      className="h-64 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSeleccionar={onSeleccionar} />
      {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={iconoSeleccion} />}
    </MapContainer>
  );
}
