export type Especie = 'Perro' | 'Gato';

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
  createdAt: string;
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
