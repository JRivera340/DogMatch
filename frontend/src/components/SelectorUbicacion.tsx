import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import { BuscadorCiudad } from './BuscadorCiudad';
import { DEPARTAMENTOS_COLOMBIA, centroDepartamento } from '../data/ciudades';
import { useInvalidarMapaAlRedimensionar } from '../utils/useInvalidarMapa';

const iconoSeleccion = L.divIcon({
  className: '',
  html: `<div style="position:relative"><div style="background:#c81e3a;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

// Bogotá — centro por defecto cuando no hay geolocalización disponible
const CENTRO_BOGOTA: [number, number] = [4.711, -74.0721];
const ZOOM_DEFECTO = 12;
const ZOOM_PUNTO = 14;

interface Props {
  lat: number | null;
  lng: number | null;
  onSeleccionar: (lat: number, lng: number) => void;
  error?: string;
}

function ClickHandler({ onSeleccionar }: { onSeleccionar: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Recentra el mapa en la ubicación del navegador si el usuario la concede, una sola vez al montar. */
function GeolocalizarAlMontar({ yaTieneSeleccion }: { yaTieneSeleccion: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (yaTieneSeleccion || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        map.setView([posicion.coords.latitude, posicion.coords.longitude], ZOOM_DEFECTO);
      },
      () => {
        // permiso denegado o no disponible: se queda en el centro por defecto (Bogotá)
      },
      { timeout: 4000 },
    );
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** Select flotante para saltar al centro de un departamento — mismo criterio que BuscadorCiudad: solo navega, nunca marca el punto. */
function SelectorDepartamentoMapa({ map }: { map: LeafletMap | null }) {
  const [valor, setValor] = useState('');

  function irADepartamento(nombre: string) {
    setValor(nombre);
    const centro = centroDepartamento(nombre);
    if (!centro || !map) return;
    map.flyTo([centro.lat, centro.lng], centro.zoom, { duration: 1.2 });
  }

  return (
    <div className="mapa-control w-44 sm:w-52">
      <select
        value={valor}
        onChange={(e) => irADepartamento(e.target.value)}
        className="u-body w-full bg-transparent px-2.5 py-2 text-ink focus:outline-none"
      >
        <option value="" disabled>
          Ir a departamento...
        </option>
        {DEPARTAMENTOS_COLOMBIA.map((departamento) => (
          <option key={departamento} value={departamento}>
            {departamento}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SelectorUbicacion({ lat, lng, onSeleccionar, error }: Props) {
  const tienePunto = lat !== null && lng !== null;
  const [map, setMap] = useState<LeafletMap | null>(null);
  useInvalidarMapaAlRedimensionar(map);

  return (
    <div className="relative">
      <MapContainer
        ref={setMap}
        center={tienePunto ? [lat, lng] : CENTRO_BOGOTA}
        zoom={tienePunto ? ZOOM_PUNTO : ZOOM_DEFECTO}
        style={{ height: '16rem', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeolocalizarAlMontar yaTieneSeleccion={tienePunto} />
        <ClickHandler onSeleccionar={onSeleccionar} />
        {tienePunto && (
          <Marker
            position={[lat, lng]}
            icon={iconoSeleccion}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const posicion = e.target.getLatLng();
                onSeleccionar(posicion.lat, posicion.lng);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-2 right-2 z-[500] flex flex-col items-end gap-1.5">
        <BuscadorCiudad map={map} ayuda="Solo navega — el click en el mapa marca el punto" />
        <SelectorDepartamentoMapa map={map} />
      </div>

      {error && !tienePunto && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] border-b-2 border-brand-600 bg-brand-50/95 px-3 py-2 text-[13px] font-medium text-brand-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line-strong bg-paper-raised px-3 py-1.5">
        <span className="u-data text-ink-faint">
          {tienePunto ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Sin punto marcado'}
        </span>
        {tienePunto && <span className="u-data text-brand-600">Arrastra el pin para ajustar</span>}
      </div>
    </div>
  );
}
