import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import type { Mascota } from '../types';
import type { Ciudad } from '../data/ciudades';
import { BuscadorCiudad } from './BuscadorCiudad';
import { DetalleMascotaModal } from './DetalleMascotaModal';
import { MapaLeyenda } from './MapaLeyenda';
import { useInvalidarMapaAlRedimensionar } from '../utils/useInvalidarMapa';

// Color = tipo de reporte mientras el caso está activo; una vez resuelto
// (estado="encontrada", sin importar el tipo) se muestra en gris apagado.
const COLOR_PERDIDA = '#eab308'; // Amarillo
const COLOR_RESCATADA = '#3b82f6'; // Azul
const COLOR_RESUELTA = '#ef4444'; // Rojo

function crearIcono(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative"><div style="background:${color};width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div><div class="pin-sombra"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}

function crearIconoEmoji(emoji: string) {
  return L.divIcon({
    className: '',
    html: `<div style="font-size: 22px; line-height: 1; text-align: center; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.4));">${emoji}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const iconoPerdida = crearIcono(COLOR_PERDIDA);
const iconoRescatada = crearIcono(COLOR_RESCATADA);
const iconoResuelta = crearIconoEmoji('❤️');

function iconoDe(mascota: Mascota) {
  if (mascota.estado === 'encontrada') return iconoResuelta;
  return mascota.tipoReporte === 'rescatada' ? iconoRescatada : iconoPerdida;
}

const CENTRO_COLOMBIA: [number, number] = [4.5709, -74.2973];
const ZOOM_COLOMBIA = 6;

interface Props {
  mascotas: Mascota[];
  onSeleccionar?: (mascota: Mascota) => void;
  /** Ciudad activa del filtro — si se pasa, recentra el mapa en ella (null = vista completa de Colombia). */
  ciudadFiltro?: Ciudad | null;
  /** false oculta los botones +/- de Leaflet — útil en mobile, donde chocan con los controles flotantes y el pellizco ya permite hacer zoom. */
  zoomControl?: boolean;
  /** Posición de la leyenda de colores — por defecto pegada a la esquina inferior izquierda. */
  leyendaClassName?: string;
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

export function MapaMascotas({
  mascotas,
  onSeleccionar,
  ciudadFiltro,
  zoomControl = true,
  leyendaClassName = 'bottom-2 left-2',
}: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [detalle, setDetalle] = useState<Mascota | null>(null);
  useInvalidarMapaAlRedimensionar(map);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={CENTRO_COLOMBIA}
        zoom={ZOOM_COLOMBIA}
        zoomControl={zoomControl}
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
            icon={iconoDe(mascota)}
            eventHandlers={{ click: () => onSeleccionar?.(mascota) }}
          >
            <Popup>
              <div className="u-body">
                <p className="u-title-card text-[1rem]">{mascota.nombre}</p>
                {mascota.tipoReporte === 'rescatada' && (
                  <p className="u-data text-brand-600">Busca su dueño</p>
                )}
                <p className="text-ink-soft">{mascota.raza}</p>
                <p className="u-data text-ink-faint">{mascota.ultimaVezLugarTexto}</p>
                <button
                  type="button"
                  onClick={() => setDetalle(mascota)}
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
        <BuscadorCiudad map={map} ayuda="Solo mueve el mapa — no filtra los casos mostrados" />
      </div>
      <MapaLeyenda
        className={leyendaClassName}
        items={[
          { color: COLOR_PERDIDA, etiqueta: 'Perdida' },
          { color: COLOR_RESCATADA, etiqueta: 'Busca su dueño' },
          { color: COLOR_RESUELTA, etiqueta: 'Resuelta' },
        ]}
      />

      {detalle && <DetalleMascotaModal mascota={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}
