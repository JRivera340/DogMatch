import { useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { CIUDADES_COLOMBIA } from '../data/ciudades';

interface Props {
  /** Instancia del mapa (via ref de MapContainer). null mientras el mapa no ha montado. */
  map: LeafletMap | null;
  /** Texto corto que aclara qué hace la búsqueda en este mapa (navegación vs. selección de punto). */
  ayuda: string;
}

/**
 * Combobox flotante de búsqueda rápida de ciudad. Al hacer foco/click
 * despliega la lista completa de ciudades (se puede elegir sin escribir);
 * al escribir, filtra la lista. Solo mueve el mapa (flyTo) — nunca marca
 * un punto ni filtra los datos mostrados.
 *
 * Se renderiza como hermano literal de <MapContainer> (nunca como hijo):
 * Leaflet fuerza `overflow: hidden` en `.leaflet-container`, así que si
 * el dropdown viviera dentro de ese div quedaría recortado e invisible.
 * Recibe la instancia del mapa por prop (ref de MapContainer) en vez de
 * usar useMap(), justamente para poder vivir fuera de ese árbol.
 */
export function BuscadorCiudad({ map, ayuda }: Props) {
  const [valor, setValor] = useState('');
  const [abierto, setAbierto] = useState(false);

  const opciones = CIUDADES_COLOMBIA.filter((c) =>
    c.nombre.toLowerCase().includes(valor.trim().toLowerCase()),
  );

  function irACiudad(nombre: string, lat: number, lng: number, zoom: number) {
    map?.flyTo([lat, lng], zoom, { duration: 1.2 });
    setValor(nombre);
    setAbierto(false);
  }

  return (
    <div className="mapa-control absolute top-2 right-2 z-[500] w-44 sm:w-52">
      <div className="relative">
        <input
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 120)}
          placeholder="Buscar o elegir ciudad..."
          role="combobox"
          aria-expanded={abierto}
          aria-autocomplete="list"
          className="u-body w-full border-b border-line-strong bg-transparent px-2.5 py-2 text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {abierto && (
          <ul
            role="listbox"
            className="absolute top-full right-0 left-0 z-[600] max-h-48 overflow-y-auto border border-line-strong bg-paper-raised shadow-[2px_2px_0_rgba(34,29,26,0.1)]"
          >
            {opciones.length === 0 && (
              <li className="u-body px-2.5 py-2 text-ink-faint">Sin resultados</li>
            )}
            {opciones.map((ciudad) => (
              <li key={ciudad.nombre}>
                <button
                  type="button"
                  role="option"
                  aria-selected={valor === ciudad.nombre}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    irACiudad(ciudad.nombre, ciudad.lat, ciudad.lng, ciudad.zoom);
                  }}
                  className="u-body block w-full px-2.5 py-1.5 text-left text-ink hover:bg-brand-50 hover:text-brand-700"
                >
                  {ciudad.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="u-data px-2.5 py-1 text-[10px] text-ink-faint">{ayuda}</p>
    </div>
  );
}
