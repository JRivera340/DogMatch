interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

/** Visor de imagen a pantalla completa. Click afuera o la X cierra. */
export function ImageLightbox({ src, alt, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[1070] flex items-center justify-center bg-ink/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 border border-white/40 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        Cerrar
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[92vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
