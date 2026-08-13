import { useEffect, useState } from 'react';
import type { Mascota } from '../types';
import { registrarClick } from '../api';
import { codigoCaso, etiquetaEstadoCorta, formatearFecha } from '../utils/mascotaFormato';
import { TELEFONOS_FUNCIONARIOS } from '../data/contactoOficial';
import { BotonTelefono } from './BotonTelefono';
import { ImageLightbox } from './ImageLightbox';
import { EyeIcon, PinIcon } from './icons';

export interface AccionesAdmin {
  onAprobar: () => void;
  onRechazar: () => void;
  procesando: boolean;
}

interface Props {
  mascota: Mascota;
  onClose: () => void;
  /** Si se pasa, muestra los botones de aprobar/rechazar (uso en el panel admin). */
  admin?: AccionesAdmin;
}

/**
 * Detalle completo de un reporte — usado tanto en la vista pública
 * (botón "Ver detalle" en la card y en el popup del mapa) como en el
 * panel admin (mismo contenido, más los botones de aprobar/rechazar).
 */
export function DetalleMascotaModal({ mascota, onClose, admin }: Props) {
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const estaEncontrada = mascota.estado === 'encontrada';

  useEffect(() => {
    // Cuenta vistas del público, no las que hace un admin revisando el panel.
    if (!admin) registrarClick(mascota.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascota.id]);

  return (
    <>
      <div
        className="fixed inset-0 z-[1060] flex items-center justify-center bg-ink/60 p-3 sm:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${mascota.nombre}`}
      >
        <div
          className="max-h-[82vh] w-full max-w-2xl overflow-y-auto border-t-4 border-brand-600 bg-paper-raised shadow-[4px_4px_0_rgba(34,29,26,0.2)] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5 sm:py-3">
            <p className="u-eyebrow">Detalle del reporte</p>
            <button
              type="button"
              onClick={onClose}
              className="u-data border border-line-strong px-2.5 py-1 text-ink-soft hover:border-brand-600 hover:text-brand-700"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:gap-5 sm:p-5 sm:grid-cols-[220px_1fr]">
            <button
              type="button"
              onClick={() => setLightboxAbierto(true)}
              className="group relative block border border-line-strong"
            >
              <img
                src={mascota.fotoUrl}
                alt={mascota.nombre}
                className={`h-40 w-full object-cover sm:h-full ${estaEncontrada ? 'grayscale-[35%]' : ''}`}
              />
              <span className="u-data absolute right-2 bottom-2 border border-white/40 bg-ink/60 px-2 py-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                Ver en grande
              </span>
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="u-title-page text-[1.75rem]">{mascota.nombre}</h2>
                <div className="flex flex-col items-end gap-1">
                  <span className="u-data text-ink-faint">#{codigoCaso(mascota.id)}</span>
                  <span
                    className={`stamp text-[10px] ${estaEncontrada ? 'text-moss-700' : 'text-brand-600'}`}
                  >
                    {etiquetaEstadoCorta(mascota.tipoReporte, mascota.estado, mascota.genero)}
                  </span>
                </div>
              </div>

              {mascota.tipoReporte === 'rescatada' && mascota.estado !== 'encontrada' && (
                <p className="u-data text-brand-600">Esta mascota busca a su dueño</p>
              )}

              <p className="u-body mt-1 text-ink-soft">
                {mascota.especie} · {mascota.raza} · {mascota.genero} · {mascota.color} ·{' '}
                {mascota.tamano} · {mascota.edad}
              </p>

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

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`u-data inline-block border px-1.5 py-0.5 text-[10px] ${
                    mascota.validacion === 'aprobada'
                      ? 'border-moss-600 text-moss-700'
                      : mascota.validacion === 'rechazada'
                        ? 'border-ink-faint text-ink-faint'
                        : 'border-line-strong text-ink-faint'
                  }`}
                >
                  {mascota.validacion === 'aprobada'
                    ? 'Verificado por un administrador'
                    : mascota.validacion === 'rechazada'
                      ? 'Rechazado'
                      : 'Sin validar todavía'}
                </span>

                <span className="u-data inline-flex items-center gap-1 border border-brand-600 bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                  <EyeIcon className="h-3 w-3" />
                  {mascota.clicks} {mascota.clicks === 1 ? 'vista' : 'vistas'}
                </span>
              </div>

              <dl className="mt-4 space-y-2">
                <div className="u-body flex gap-1.5">
                  <PinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span>
                    <dt className="inline font-semibold text-ink-soft">
                      {mascota.tipoReporte === 'rescatada'
                        ? 'Encontrada el: '
                        : 'Visto por última vez: '}
                    </dt>
                    <dd className="inline">
                      {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
                    </dd>
                  </span>
                </div>
                {admin && (
                  <div className="u-body">
                    <dt className="inline font-semibold text-ink-soft">Reportado por: </dt>
                    <dd className="inline">{mascota.nombreContacto} ({mascota.emailContacto})</dd>
                  </div>
                )}
                <div className="u-body">
                  <dt className="inline font-semibold text-ink-soft">Reportado el: </dt>
                  <dd className="inline">{formatearFecha(mascota.createdAt)}</dd>
                </div>
                {mascota.senasParticulares && (
                  <div className="u-body">
                    <dt className="inline font-semibold text-ink-soft">Señas particulares: </dt>
                    <dd className="inline">{mascota.senasParticulares}</dd>
                  </div>
                )}
                {mascota.otrasSenas && (
                  <div className="u-body">
                    <dt className="inline font-semibold text-ink-soft">Otras señas: </dt>
                    <dd className="inline">{mascota.otrasSenas}</dd>
                  </div>
                )}
              </dl>

              {mascota.senas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mascota.senas.map((sena) => (
                    <span
                      key={sena}
                      className="u-data border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-soft"
                    >
                      {sena}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <p className="u-label mb-1.5">Tengo información / Tengo una Pista</p>
                <div className="flex flex-wrap gap-1.5">
                  {admin ? (
                    <>
                      <BotonTelefono telefono={mascota.telefono1} nombreMascota={mascota.nombre} />
                      {mascota.telefono2 && (
                        <BotonTelefono telefono={mascota.telefono2} nombreMascota={mascota.nombre} />
                      )}
                    </>
                  ) : (
                    TELEFONOS_FUNCIONARIOS.map((telefono) => (
                      <BotonTelefono key={telefono} telefono={telefono} nombreMascota={mascota.nombre} />
                    ))
                  )}
                </div>
              </div>

              {admin && (
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
                  {mascota.validacion !== 'aprobada' && (
                    <button
                      type="button"
                      onClick={admin.onAprobar}
                      disabled={admin.procesando}
                      className="border border-moss-700 bg-moss-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  )}
                  {mascota.validacion !== 'rechazada' && (
                    <button
                      type="button"
                      onClick={admin.onRechazar}
                      disabled={admin.procesando}
                      className="border border-brand-700 px-3 py-1.5 text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxAbierto && (
        <ImageLightbox
          src={mascota.fotoUrl}
          alt={mascota.nombre}
          onClose={() => setLightboxAbierto(false)}
        />
      )}
    </>
  );
}
