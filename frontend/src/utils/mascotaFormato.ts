import type { TipoReporte } from '../types';

/** Texto del sello/estado — depende de si es un reporte de mascota perdida o rescatada sin dueño. */
export function etiquetaEstado(tipoReporte: TipoReporte, estado: 'perdida' | 'encontrada') {
  if (estado === 'encontrada') return 'Con dueño';
  return tipoReporte === 'rescatada' ? 'Rescatada' : 'Perdida';
}

/** Texto del botón que resuelve el caso — distinto según el tipo de reporte. */
export function etiquetaAccionResolver(tipoReporte: TipoReporte) {
  return tipoReporte === 'rescatada' ? 'Marcar como adoptada' : 'Marcar como reunida con su dueño';
}

export function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function codigoCaso(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function linkWhatsApp(telefono: string, nombreMascota: string) {
  const numero = telefono.replace(/\D/g, '');
  const conIndicativo = numero.startsWith('57') ? numero : `57${numero}`;
  const mensaje = encodeURIComponent(
    `Hola, vi el reporte de ${nombreMascota} en DogMatch. Creo que puedo ayudar.`,
  );
  return `https://wa.me/${conIndicativo}?text=${mensaje}`;
}
