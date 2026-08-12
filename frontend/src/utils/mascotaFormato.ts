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
