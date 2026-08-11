export interface Mascota {
  id: string;
  nombre: string;
  raza: string;
  genero: 'Macho' | 'Hembra';
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
  raza: string;
  genero: 'Macho' | 'Hembra';
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
