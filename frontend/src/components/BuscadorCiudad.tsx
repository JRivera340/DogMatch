import { useId, useState } from 'react';
import { useMap } from 'react-leaflet';
import { CIUDADES_COLOMBIA } from '../data/ciudades';

interface Props {
  /** Texto corto que aclara qué hace la búsqueda en este mapa (navegación vs. selección de punto). */
  ayuda: string;
}

/**
 * Control flotante de búsqueda rápida de ciudad. Solo mueve el mapa
 * (flyTo) — nunca marca un punto ni filtra los datos mostrados.
 * Debe usarse como hijo de <MapContainer> para tener acceso a useMap().
 */
export function BuscadorCiudad({ ayuda }: Props) {
  const map = useMap();
  const [valor, setValor] = useState('');
  const listId = useId();

  function irACiudad(nombre: string) {
    const ciudad = CIUDADES_COLOMBIA.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (!ciudad) return;
    map.flyTo([ciudad.lat, ciudad.lng], ciudad.zoom, { duration: 1.2 });
    setValor(ciudad.nombre);
  }

  return (
    <div className="mapa-control absolute top-2 right-2 z-[500] w-44 sm:w-52">
      <input
        list={listId}
        value={valor}
        onChange={(e) => {
          setValor(e.target.value);
          irACiudad(e.target.value);
        }}
        placeholder="Buscar ciudad..."
        className="u-body w-full border-b border-line-strong bg-transparent px-2.5 py-2 text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <datalist id={listId}>
        {CIUDADES_COLOMBIA.map((ciudad) => (
          <option key={ciudad.nombre} value={ciudad.nombre} />
        ))}
      </datalist>
      <p className="u-data px-2.5 py-1 text-[10px] text-ink-faint">{ayuda}</p>
    </div>
  );
}
