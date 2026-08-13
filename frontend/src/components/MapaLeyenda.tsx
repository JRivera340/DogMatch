interface ItemLeyenda {
  color: string;
  etiqueta: string;
  /** Si se pasa, se muestra este emoji en vez del punto de color (para marcadores tipo ❤️). */
  emoji?: string;
}

interface Props {
  items: ItemLeyenda[];
  className?: string;
}

/** Leyenda de colores del mapa — hermano literal del mapa (nunca hijo, mismo motivo que BuscadorCiudad). */
export function MapaLeyenda({ items, className = '' }: Props) {
  return (
    <div className={`mapa-control absolute z-[500] px-2.5 py-2 ${className}`}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.etiqueta} className="flex items-center gap-1.5">
            {item.emoji ? (
              <span
                className="inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center text-[9px] leading-none"
                aria-hidden
              >
                {item.emoji}
              </span>
            ) : (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
            )}
            <span className="u-data text-ink-soft">{item.etiqueta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
