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
    <div className="flex items-center gap-2">
      <a
        href={linkWhatsApp(telefono, nombreMascota)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copiar}
        className="rounded-full border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
      >
        {copiado ? '¡Copiado!' : `Copiar ${telefono}`}
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
    <article className="flex gap-4 rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
      <img
        src={mascota.fotoUrl}
        alt={mascota.nombre}
        className="h-24 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-brand-800">{mascota.nombre}</h3>
          <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
            {mascota.genero}
          </span>
        </div>
        <p className="text-sm text-gray-600">{mascota.raza}</p>

        <dl className="mt-2 space-y-1 text-sm text-gray-700">
          <div>
            <dt className="inline font-semibold">Visto por última vez: </dt>
            <dd className="inline">
              {formatearFecha(mascota.ultimaVezFecha)} — {mascota.ultimaVezLugarTexto}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Residencia del dueño: </dt>
            <dd className="inline">{mascota.lugarResidencia}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-2">
          <BotonTelefono telefono={mascota.telefono1} nombreMascota={mascota.nombre} />
          <BotonTelefono telefono={mascota.telefono2} nombreMascota={mascota.nombre} />
        </div>

        {editToken && mascota.estado === 'perdida' && (
          <button
            type="button"
            onClick={handleMarcarEncontrada}
            disabled={marcando}
            className="mt-3 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {marcando ? 'Marcando...' : 'Marcar como encontrada'}
          </button>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </article>
  );
}
