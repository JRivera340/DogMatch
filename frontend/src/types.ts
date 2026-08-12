export type Especie = 'Perro' | 'Gato';
export type Validacion = 'pendiente' | 'aprobada' | 'rechazada';

export interface Mascota {
  id: string;
  nombre: string;
  especie: Especie;
  raza: string;
  genero: 'Macho' | 'Hembra';
  color: string;
  fotoUrl: string;
  ultimaVezFecha: string;
  ultimaVezLugarTexto: string;
  lat: number;
  lng: number;
  lugarResidencia: string;
  telefono1: string;
  telefono2: string;
  estado: 'perdida' | 'encontrada';
  validacion: Validacion;
  createdAt: string;
}

export interface Paginado<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NuevaMascota {
  nombre: string;
  especie: Especie;
  raza: string;
  genero: 'Macho' | 'Hembra';
  color: string;
  fotoUrl: string;
  ultimaVezFecha: string;
  ultimaVezLugarTexto: string;
  lat: number;
  lng: number;
  lugarResidencia: string;
  telefono1: string;
  telefono2: string;
  autorizaTratamientoDatos: boolean;
}
