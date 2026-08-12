import { useEffect, useState, type RefObject } from 'react';

/**
 * Calcula en píxeles el espacio vertical real disponible desde el borde
 * superior del elemento referenciado hasta el fondo del viewport, restando
 * el footer si existe. Evitamos depender de cadenas de flexbox/porcentajes
 * (percent-height dentro de flex anidado es frágil entre navegadores y
 * layouts condicionales como pestañas) — esto siempre da un número exacto,
 * medido de verdad, sin adivinar.
 */
export function useAlturaDisponible(ref: RefObject<HTMLElement | null>) {
  const [altura, setAltura] = useState<number | null>(null);

  useEffect(() => {
    function calcular() {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const footer = document.querySelector('footer');
      const alturaFooter = footer ? footer.getBoundingClientRect().height : 0;
      const disponible = window.innerHeight - top - alturaFooter;
      setAltura(Math.max(320, disponible));
    }

    calcular();
    const id = requestAnimationFrame(calcular);
    window.addEventListener('resize', calcular);

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener('resize', calcular);
      };
    }

    const observer = new ResizeObserver(calcular);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', calcular);
      observer.disconnect();
    };
  }, [ref]);

  return altura;
}
