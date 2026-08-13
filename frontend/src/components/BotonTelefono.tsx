import { useState } from 'react';
import { PhoneIcon } from './icons';
import { linkWhatsApp } from '../utils/mascotaFormato';

interface Props {
  telefono: string;
  nombreMascota: string;
  /** Solo el ícono de WhatsApp, sin el botón de copiar número — para listados angostos. */
  compacto?: boolean;
}

export function BotonTelefono({ telefono, nombreMascota, compacto = false }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(telefono);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (compacto) {
    return (
      <a
        href={linkWhatsApp(telefono, nombreMascota)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${telefono}`}
        className="flex items-center gap-1 border border-moss-700 bg-moss-600 px-1.5 py-1 text-white transition-colors hover:bg-moss-700"
      >
        <PhoneIcon className="h-3 w-3 shrink-0" />
        <span className="font-mono text-[10px] leading-none">{telefono}</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={linkWhatsApp(telefono, nombreMascota)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 border border-moss-700 bg-moss-600 px-2.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-moss-700"
      >
        <PhoneIcon className="h-3.5 w-3.5" />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copiar}
        className="u-data border border-line-strong px-2.5 py-1.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700"
      >
        {copiado ? 'Copiado' : telefono}
      </button>
    </div>
  );
}
