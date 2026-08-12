export interface Ciudad {
  nombre: string;
  departamento: string;
  lat: number;
  lng: number;
  zoom: number;
}

// Capital de cada uno de los 32 departamentos de Colombia + Bogotá D.C.
export const CIUDADES_COLOMBIA: Ciudad[] = [
  { nombre: 'Bogotá', departamento: 'Bogotá D.C.', lat: 4.711, lng: -74.0721, zoom: 12 },
  { nombre: 'Medellín', departamento: 'Antioquia', lat: 6.2442, lng: -75.5812, zoom: 12 },
  { nombre: 'Cali', departamento: 'Valle del Cauca', lat: 3.4516, lng: -76.532, zoom: 12 },
  { nombre: 'Barranquilla', departamento: 'Atlántico', lat: 10.9639, lng: -74.7964, zoom: 12 },
  { nombre: 'Cartagena', departamento: 'Bolívar', lat: 10.391, lng: -75.4794, zoom: 12 },
  { nombre: 'Bucaramanga', departamento: 'Santander', lat: 7.1193, lng: -73.1227, zoom: 13 },
  { nombre: 'Pereira', departamento: 'Risaralda', lat: 4.8143, lng: -75.6946, zoom: 13 },
  { nombre: 'Manizales', departamento: 'Caldas', lat: 5.0689, lng: -75.5174, zoom: 13 },
  { nombre: 'Cúcuta', departamento: 'Norte de Santander', lat: 7.8939, lng: -72.5078, zoom: 13 },
  { nombre: 'Santa Marta', departamento: 'Magdalena', lat: 11.2408, lng: -74.199, zoom: 13 },
  { nombre: 'Ibagué', departamento: 'Tolima', lat: 4.4389, lng: -75.2322, zoom: 13 },
  { nombre: 'Villavicencio', departamento: 'Meta', lat: 4.142, lng: -73.6266, zoom: 13 },
  { nombre: 'Armenia', departamento: 'Quindío', lat: 4.5339, lng: -75.6811, zoom: 13 },
  { nombre: 'Leticia', departamento: 'Amazonas', lat: -4.2153, lng: -69.9406, zoom: 13 },
  { nombre: 'Arauca', departamento: 'Arauca', lat: 7.0847, lng: -70.7591, zoom: 13 },
  { nombre: 'Tunja', departamento: 'Boyacá', lat: 5.5353, lng: -73.3678, zoom: 13 },
  { nombre: 'Florencia', departamento: 'Caquetá', lat: 1.6144, lng: -75.6062, zoom: 13 },
  { nombre: 'Yopal', departamento: 'Casanare', lat: 5.3378, lng: -72.3959, zoom: 13 },
  { nombre: 'Popayán', departamento: 'Cauca', lat: 2.4448, lng: -76.6147, zoom: 13 },
  { nombre: 'Valledupar', departamento: 'Cesar', lat: 10.4631, lng: -73.2532, zoom: 13 },
  { nombre: 'Quibdó', departamento: 'Chocó', lat: 5.6947, lng: -76.6583, zoom: 13 },
  { nombre: 'Montería', departamento: 'Córdoba', lat: 8.7479, lng: -75.8814, zoom: 13 },
  { nombre: 'Zipaquirá', departamento: 'Cundinamarca', lat: 5.0264, lng: -74.0035, zoom: 13 },
  { nombre: 'Inírida', departamento: 'Guainía', lat: 3.8653, lng: -67.9239, zoom: 13 },
  { nombre: 'San José del Guaviare', departamento: 'Guaviare', lat: 2.5709, lng: -72.6437, zoom: 13 },
  { nombre: 'Neiva', departamento: 'Huila', lat: 2.9273, lng: -75.2819, zoom: 13 },
  { nombre: 'Riohacha', departamento: 'La Guajira', lat: 11.5444, lng: -72.9072, zoom: 13 },
  { nombre: 'Pasto', departamento: 'Nariño', lat: 1.2136, lng: -77.2811, zoom: 13 },
  { nombre: 'Mocoa', departamento: 'Putumayo', lat: 1.1487, lng: -76.6478, zoom: 13 },
  { nombre: 'San Andrés', departamento: 'San Andrés y Providencia', lat: 12.5847, lng: -81.7006, zoom: 13 },
  { nombre: 'Sincelejo', departamento: 'Sucre', lat: 9.3047, lng: -75.3978, zoom: 13 },
  { nombre: 'Mitú', departamento: 'Vaupés', lat: 1.1983, lng: -70.1733, zoom: 13 },
  { nombre: 'Puerto Carreño', departamento: 'Vichada', lat: 6.1891, lng: -67.4859, zoom: 13 },
];

export const DEPARTAMENTOS_COLOMBIA: string[] = Array.from(
  new Set(CIUDADES_COLOMBIA.map((c) => c.departamento)),
).sort((a, b) => a.localeCompare(b));

/** Centroide (promedio) de las ciudades conocidas de un departamento, con un zoom más abierto que el de ciudad. */
export function centroDepartamento(departamento: string): Ciudad | null {
  const ciudades = CIUDADES_COLOMBIA.filter((c) => c.departamento === departamento);
  if (ciudades.length === 0) return null;

  const lat = ciudades.reduce((suma, c) => suma + c.lat, 0) / ciudades.length;
  const lng = ciudades.reduce((suma, c) => suma + c.lng, 0) / ciudades.length;
  const zoom = Math.min(...ciudades.map((c) => c.zoom)) - 2;

  return { nombre: departamento, departamento, lat, lng, zoom };
}
