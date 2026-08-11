import { z } from 'zod';

// Teléfono colombiano: 10 dígitos, con o sin indicativo +57
const telefonoRegex = /^(\+?57)?[3][0-9]{9}$/;

// Rango geográfico aproximado de Colombia continental + insular
const LAT_MIN = -4.5;
const LAT_MAX = 13.5;
const LNG_MIN = -82;
const LNG_MAX = -66.8;

export const crearMascotaSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido').max(80),
  raza: z.string().trim().min(1, 'Raza requerida').max(80),
  genero: z.enum(['Macho', 'Hembra']),
  fotoUrl: z.string().trim().url('fotoUrl debe ser una URL válida'),
  ultimaVezFecha: z
    .string()
    .datetime({ message: 'ultimaVezFecha debe ser ISO 8601' })
    .refine((v) => new Date(v).getTime() <= Date.now(), {
      message: 'ultimaVezFecha no puede ser futura',
    }),
  ultimaVezLugarTexto: z.string().trim().min(1).max(200),
  lat: z.number().min(LAT_MIN).max(LAT_MAX),
  lng: z.number().min(LNG_MIN).max(LNG_MAX),
  lugarResidencia: z.string().trim().min(1).max(200),
  telefono1: z.string().trim().regex(telefonoRegex, 'telefono1 inválido, use formato colombiano'),
  telefono2: z.string().trim().regex(telefonoRegex, 'telefono2 inválido, use formato colombiano'),
  autorizaTratamientoDatos: z.literal(true, {
    message: 'Debe autorizar el tratamiento de datos personales',
  }),
});

export const marcarEncontradaSchema = z.object({
  editToken: z.string().uuid('editToken inválido'),
});

export const presignSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z
    .string()
    .refine((v) => v.startsWith('image/'), 'contentType debe ser una imagen'),
});
