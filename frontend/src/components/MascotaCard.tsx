import { useState } from 'react';
import type { Mascota } from '../types';
import { marcarEncontrada, obtenerTokensGuardados } from '../api';
import { TELEFONOS_FUNCIONARIOS } from '../data/contactoOficial';
import { PinIcon } from './icons';
import { BotonTelefono } from './BotonTelefono';
import { DetalleMascotaModal } from './DetalleMascotaModal';
import { codigoCaso, etiquetaAccionResolver, etiquetaEstado, formatearFecha } from '../utils/mascotaFormato';

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
    <article className="flex border border-line bg-paper-raised">
      <button
        type="button"
        onClick={() => setDetalleAbierto(true)}
        className="relative w-24 shrink-0 overflow-visible sm:w-28"
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
          {etiquetaEstado(mascota.tipoReporte, mascota.estado)}
        </span>
      </button>

      <div className="perforation bg-paper-raised" aria-hidden />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="u-title-card truncate">{mascota.nombre}</h3>
            {mascota.tipoReporte === 'rescatada' && (
              <p className="u-data text-brand-600">Mascota rescatada · busca dueño</p>
            )}
            <p className="u-body text-ink-soft">
              {mascota.especie} · {mascota.raza} · {mascota.genero} · {mascota.color} ·{' '}
              {mascota.tamano} · {mascota.edad}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="u-data text-ink-faint">#{codigoCaso(mascota.id)}</span>
            <span
              className={`u-data border px-1.5 py-0.5 text-[10px] ${
                mascota.validacion === 'aprobada'
                  ? 'border-moss-600 text-moss-700'
                  : 'border-line-strong text-ink-faint'
              }`}
            >
              {mascota.validacion === 'aprobada' ? 'Verificado' : 'Sin validar'}
            </span>
          </div>
        </div>

        {(mascota.esUrgente || mascota.esAsustadiza) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mascota.esUrgente && (
              <span className="u-data border border-brand-600 bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">
                Urgente · condición de salud
              </span>
            )}
            {mascota.esAsustadiza && (
              <span className="u-data border border-brand-600 bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">
                Acercarse con cuidado
              </span>
            )}
          </div>
        )}

        <dl className="mt-3 space-y-1.5">
          <div className="u-body flex gap-1.5">
            <PinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
            <span>
              <dt className="inline font-semibold text-ink-soft">Visto por última vez: </dt>
              <dd className="inline">
                {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
              </dd>
            </span>
          </div>
          <div className="u-body">
            <dt className="inline font-semibold text-ink-soft">
              {mascota.tipoReporte === 'rescatada' ? 'Dónde está ahora: ' : 'Residencia del dueño: '}
            </dt>
            <dd className="inline">{mascota.lugarResidencia}</dd>
          </div>
        </dl>

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {TELEFONOS_FUNCIONARIOS.map((telefono) => (
            <BotonTelefono key={telefono} telefono={telefono} nombreMascota={mascota.nombre} />
          ))}
          <button
            type="button"
            onClick={() => setDetalleAbierto(true)}
            className="u-data border border-line-strong px-2.5 py-1.5 text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700"
          >
            Ver detalle
          </button>
        </div>

        {editToken && mascota.estado === 'perdida' && (
          <button
            type="button"
            onClick={handleMarcarEncontrada}
            disabled={marcando}
            className="mt-3.5 border border-brand-800 bg-brand-800 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-50"
          >
            {marcando ? 'Marcando...' : etiquetaAccionResolver(mascota.tipoReporte)}
          </button>
        )}
        {error && <p className="mt-2 text-[13px] font-medium text-brand-700">{error}</p>}
      </div>

      {detalleAbierto && (
        <DetalleMascotaModal mascota={mascota} onClose={() => setDetalleAbierto(false)} />
      )}
    </article>
  );
}
