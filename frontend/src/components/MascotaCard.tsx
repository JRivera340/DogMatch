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
        className="flex items-center gap-1 rounded-md bg-moss-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-moss-700"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copiar}
        className="rounded-md border border-line-strong px-2.5 py-1.5 font-mono text-xs font-medium text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-700"
      >
        {copiado ? 'Copiado ✓' : telefono}
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
    <article className="relative flex overflow-hidden rounded-lg border border-line bg-paper-raised shadow-sm shadow-ink/5">
      <div className="relative w-24 shrink-0 sm:w-28">
        <img src={mascota.fotoUrl} alt={mascota.nombre} className="h-full w-full object-cover" />
        <span
          className="stamp absolute top-2 left-2 border-white bg-brand-600/90 text-white shadow-sm"
          aria-hidden
        >
          Perdida
        </span>
      </div>

      <div className="perforation w-px shrink-0 bg-line" aria-hidden />

      <div className="min-w-0 flex-1 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="truncate font-display text-lg leading-tight font-extrabold text-ink">
              {mascota.nombre}
            </h3>
            <p className="text-xs text-ink-soft">
              {mascota.raza} · {mascota.genero}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] tracking-wider text-ink-faint">
            #{codigoCaso(mascota.id)}
          </span>
        </div>

        <dl className="mt-2.5 space-y-1 text-[13px] text-ink">
          <div>
            <dt className="inline font-semibold text-ink-soft">Visto por última vez: </dt>
            <dd className="inline">
              {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-ink-soft">Residencia del dueño: </dt>
            <dd className="inline">{mascota.lugarResidencia}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <BotonTelefono telefono={mascota.telefono1} nombreMascota={mascota.nombre} />
          <BotonTelefono telefono={mascota.telefono2} nombreMascota={mascota.nombre} />
        </div>

        {editToken && mascota.estado === 'perdida' && (
          <button
            type="button"
            onClick={handleMarcarEncontrada}
            disabled={marcando}
            className="mt-3 rounded-md bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-50"
          >
            {marcando ? 'Marcando...' : '✓ Marcar como encontrada'}
          </button>
        )}
        {error && <p className="mt-2 text-xs text-brand-700">{error}</p>}
      </div>
    </article>
  );
}
