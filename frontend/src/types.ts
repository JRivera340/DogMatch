export type Especie = 'Perro' | 'Gato';
export type Validacion = 'pendiente' | 'aprobada' | 'rechazada';
export type Tamano = 'Pequeño' | 'Mediano' | 'Grande';
export type Edad = 'Cachorro' | 'Joven' | 'Adulto' | 'Senior';
export type TipoReporte = 'perdida' | 'rescatada';

export interface Mascota {
  id: string;
  nombre: string;
  tipoReporte: TipoReporte;
  especie: Especie;
  raza: string;
  genero: 'Macho' | 'Hembra';
  color: string;
  tamano: Tamano;
  edad: Edad;
  senasParticulares: string;
  senas: string[];
  otrasSenas: string;
  esUrgente: boolean;
  esAsustadiza: boolean;
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
  clicks: number;
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
  tipoReporte: TipoReporte;
  especie: Especie;
  raza: string;
  genero: 'Macho' | 'Hembra';
  color: string;
  tamano: Tamano;
  edad: Edad;
  senasParticulares: string;
  senas: string[];
  otrasSenas: string;
  esUrgente: boolean;
  esAsustadiza: boolean;
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
