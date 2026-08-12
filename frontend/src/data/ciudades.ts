export interface Ciudad {
  nombre: string;
  departamento: string;
  lat: number;
  lng: number;
  zoom: number;
}

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
];

export const DEPARTAMENTOS_COLOMBIA: string[] = Array.from(
  new Set(CIUDADES_COLOMBIA.map((c) => c.departamento)),
).sort((a, b) => a.localeCompare(b));
