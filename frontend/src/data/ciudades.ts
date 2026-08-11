export interface Ciudad {
  nombre: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const CIUDADES_COLOMBIA: Ciudad[] = [
  { nombre: 'Bogotá', lat: 4.711, lng: -74.0721, zoom: 12 },
  { nombre: 'Medellín', lat: 6.2442, lng: -75.5812, zoom: 12 },
  { nombre: 'Cali', lat: 3.4516, lng: -76.532, zoom: 12 },
  { nombre: 'Barranquilla', lat: 10.9639, lng: -74.7964, zoom: 12 },
  { nombre: 'Cartagena', lat: 10.391, lng: -75.4794, zoom: 12 },
  { nombre: 'Bucaramanga', lat: 7.1193, lng: -73.1227, zoom: 13 },
  { nombre: 'Pereira', lat: 4.8143, lng: -75.6946, zoom: 13 },
  { nombre: 'Manizales', lat: 5.0689, lng: -75.5174, zoom: 13 },
  { nombre: 'Cúcuta', lat: 7.8939, lng: -72.5078, zoom: 13 },
  { nombre: 'Santa Marta', lat: 11.2408, lng: -74.199, zoom: 13 },
  { nombre: 'Ibagué', lat: 4.4389, lng: -75.2322, zoom: 13 },
  { nombre: 'Villavicencio', lat: 4.142, lng: -73.6266, zoom: 13 },
  { nombre: 'Armenia', lat: 4.5339, lng: -75.6811, zoom: 13 },
];
