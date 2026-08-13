import { useState } from 'react';
import type { Mascota } from '../types';
import { marcarEncontrada, obtenerTokensGuardados } from '../api';
import { TELEFONOS_FUNCIONARIOS } from '../data/contactoOficial';
import { PinIcon } from './icons';
import { BotonTelefono } from './BotonTelefono';
import { DetalleMascotaModal } from './DetalleMascotaModal';
import { etiquetaAccionResolver, etiquetaEstado, formatearFecha } from '../utils/mascotaFormato';

interface Props {
  mascota: Mascota;
  onEncontrada?: (id: string) => void;
}

export function MascotaCard({ mascota, onEncontrada }: Props) {
  const [marcando, setMarcando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const editToken = obtenerTokensGuardados()[mascota.id];
  const estaEncontrada = mascota.estado === 'encontrada';

  async function handleMarcarEncontrada() {
    if (!editToken) return;
    setMarcando(true);
    setError(null);
    try {
      await marcarEncontrada(mascota.id, editToken);
      onEncontrada?.(mascota.id);
    } catch {
      setError('No se pudo actualizar. Intenta de nuevo.');
    } finally {
      setMarcando(false);
    }
  }

  return (
    <article className="flex h-[150px] border border-line bg-paper-raised sm:h-[168px]">
      <button
        type="button"
        onClick={() => setDetalleAbierto(true)}
        className="relative w-28 shrink-0 overflow-visible sm:w-32"
        aria-label={`Ver detalle de ${mascota.nombre}`}
      >
        <img
          src={mascota.fotoUrl}
          alt={mascota.nombre}
          className={`h-full w-full object-cover contrast-[1.03] ${estaEncontrada ? 'grayscale-[35%]' : 'grayscale-[8%]'}`}
        />
        <span
          className={`stamp absolute -top-2 -left-2 bg-paper-raised ${estaEncontrada ? 'text-moss-700' : 'text-brand-600'}`}
          aria-hidden
        >
          {etiquetaEstado(mascota.tipoReporte, mascota.estado, mascota.genero)}
        </span>
      </button>

      <div className="perforation bg-paper-raised" aria-hidden />

      <div className="min-w-0 flex-1 overflow-hidden py-1.5 pr-2.5 pl-2 sm:p-4">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <h3 className="u-title-card truncate text-[13px] sm:text-base">{mascota.nombre}</h3>
            <p className="truncate text-[11px] text-ink-soft sm:u-body">
              {mascota.tipoReporte === 'rescatada' && (
                <span className="text-brand-600">Encontrado sin dueño conocido · </span>
              )}
              {mascota.especie} · {mascota.raza} · {mascota.genero} · {mascota.color}
            </p>
          </div>
          <span
            className={`u-data shrink-0 border px-1.5 py-0.5 text-[9px] sm:text-[10px] ${
              mascota.validacion === 'aprobada'
                ? 'border-moss-600 text-moss-700'
                : 'border-line-strong text-ink-faint'
            }`}
          >
            {mascota.validacion === 'aprobada' ? 'Verificado' : 'Sin validar'}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-ink-soft sm:u-body">
          <PinIcon className="h-3 w-3 shrink-0 text-ink-faint" />
          <span className="truncate">
            {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
          </span>
        </p>



        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <BotonTelefono
            telefono={TELEFONOS_FUNCIONARIOS[mascota.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % TELEFONOS_FUNCIONARIOS.length]}
            nombreMascota={mascota.nombre}
            compacto
          />
          <button
            type="button"
            onClick={() => setDetalleAbierto(true)}
            className="u-data border border-line-strong px-2 py-1 text-[11px] text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700 sm:py-1.5 sm:text-[13px]"
          >
            Ver detalle
          </button>
        </div>


        {error && <p className="mt-1.5 text-[13px] font-medium text-brand-700">{error}</p>}
      </div>

      {detalleAbierto && (
        <DetalleMascotaModal mascota={mascota} onClose={() => setDetalleAbierto(false)} />
      )}
    </article>
  );
}
