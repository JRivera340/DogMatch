import { useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';

/**
 * Leaflet mide su contenedor de forma síncrona al montar. Si ese contenedor
 * vive dentro de una cadena de flexbox (pestañas, layouts condicionales,
 * sidebars que se abren/cierran), puede quedar con 0 de alto/ancho aunque
 * el CSS final sea correcto — el mapa se ve en blanco. invalidateSize()
 * fuerza a Leaflet a remedir. Se dispara al montar y ante cualquier cambio
 * de tamaño real del contenedor (ResizeObserver), para cubrir cambios de
 * pestaña, layout responsive, etc.
 */
export function useInvalidarMapaAlRedimensionar(map: LeafletMap | null) {
  useEffect(() => {
    if (!map) return;

    const invalidar = () => map.invalidateSize();
    const id = requestAnimationFrame(invalidar);

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(id);
    }

    const contenedor = map.getContainer();
    const observer = new ResizeObserver(invalidar);
    observer.observe(contenedor);

    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
    };
  }, [map]);
}
