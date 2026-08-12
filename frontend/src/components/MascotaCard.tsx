import { useState } from 'react';
import type { Mascota } from '../types';
import { marcarEncontrada, obtenerTokensGuardados } from '../api';

interface Props {
  mascota: Mascota;
  onEncontrada?: (id: string) => void;
}

function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function codigoCaso(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function linkWhatsApp(telefono: string, nombreMascota: string) {
  const numero = telefono.replace(/\D/g, '');
  const conIndicativo = numero.startsWith('57') ? numero : `57${numero}`;
  const mensaje = encodeURIComponent(
    `Hola, vi el reporte de ${nombreMascota} en DogMatch. Creo que puedo ayudar.`,
  );
  return `https://wa.me/${conIndicativo}?text=${mensaje}`;
}

function BotonTelefono({ telefono, nombreMascota }: { telefono: string; nombreMascota: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(telefono);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={linkWhatsApp(telefono, nombreMascota)}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-moss-700 bg-moss-600 px-2.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-moss-700"
      >
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

export function MascotaCard({ mascota, onEncontrada }: Props) {
  const [marcando, setMarcando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editToken = obtenerTokensGuardados()[mascota.id];

  async function handleMarcarEncontrada() {
    if (!editToken) return;
    setMarcando(true);
    setError(null);
    try {
      await marcarEncontrada(mascota.id, editToken);
      onEncontrada?.(mascota.id);
    } catch {
      setError('No se pudo marcar como encontrada. Intenta de nuevo.');
    } finally {
      setMarcando(false);
    }
  }

  return (
    <article className="flex border border-line bg-paper-raised">
      <div className="relative w-24 shrink-0 overflow-visible sm:w-28">
        <img
          src={mascota.fotoUrl}
          alt={mascota.nombre}
          className="h-full w-full object-cover grayscale-[8%] contrast-[1.03]"
        />
        <span
          className="stamp absolute -top-2 -left-2 bg-paper-raised text-brand-600"
          aria-hidden
        >
          Perdida
        </span>
      </div>

      <div className="perforation bg-paper-raised" aria-hidden />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="u-title-card truncate">{mascota.nombre}</h3>
            <p className="u-body text-ink-soft">
              {mascota.especie} · {mascota.raza} · {mascota.genero} · {mascota.color}
            </p>
          </div>
          <span className="u-data shrink-0 text-ink-faint">#{codigoCaso(mascota.id)}</span>
        </div>

        <dl className="mt-3 space-y-1.5">
          <div className="u-body">
            <dt className="inline font-semibold text-ink-soft">Visto por última vez: </dt>
            <dd className="inline">
              {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
            </dd>
          </div>
          <div className="u-body">
            <dt className="inline font-semibold text-ink-soft">Residencia del dueño: </dt>
            <dd className="inline">{mascota.lugarResidencia}</dd>
          </div>
        </dl>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <BotonTelefono telefono={mascota.telefono1} nombreMascota={mascota.nombre} />
          <BotonTelefono telefono={mascota.telefono2} nombreMascota={mascota.nombre} />
        </div>

        {editToken && mascota.estado === 'perdida' && (
          <button
            type="button"
            onClick={handleMarcarEncontrada}
            disabled={marcando}
            className="mt-3.5 border border-brand-800 bg-brand-800 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-50"
          >
            {marcando ? 'Marcando...' : 'Marcar como encontrada'}
          </button>
        )}
        {error && <p className="mt-2 text-[13px] font-medium text-brand-700">{error}</p>}
      </div>
    </article>
  );
}
