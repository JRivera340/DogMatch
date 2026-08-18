import { z } from 'zod';

// Teléfono colombiano: 10 dígitos, con o sin indicativo +57
const telefonoRegex = /^(\+?57)?[3][0-9]{9}$/;

// Rango geográfico aproximado de Colombia continental + insular
const LAT_MIN = -4.5;
const LAT_MAX = 13.5;
const LNG_MIN = -82;
const LNG_MAX = -66.8;

export const SENAS_DISPONIBLES = [
  'Lleva collar',
  'Lleva placa con datos',
  'Tiene microchip',
  'Esterilizado',
  'Cicatriz visible',
  'Cojea',
  'Manchas distintivas',
  'Ojos de distinto color',
  'Sin cola',
  'Le falta una pata',
] as const;

export const crearMascotaSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido').max(80),
  tipoReporte: z.enum(['perdida', 'rescatada']),
  especie: z.enum(['Perro', 'Gato']),
  raza: z.string().trim().min(1, 'Raza requerida').max(80),
  genero: z.enum(['Macho', 'Hembra']),
  color: z.string().trim().min(1, 'Color requerido').max(60),
  tamano: z.enum(['Pequeño', 'Mediano', 'Grande']),
  edad: z.enum(['Cachorro', 'Joven', 'Adulto', 'Senior']),
  senasParticulares: z.string().trim().max(300).optional().default(''),
  senas: z.array(z.enum(SENAS_DISPONIBLES)).max(SENAS_DISPONIBLES.length).optional().default([]),
  otrasSenas: z.string().trim().max(200).optional().default(''),
  esUrgente: z.boolean().optional().default(false),
  esAsustadiza: z.boolean().optional().default(false),
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
  nombreContacto: z.string().trim().min(1).max(100),
  emailContacto: z.string().trim().email().max(100),
  telefono1: z.string().trim().regex(telefonoRegex, 'telefono1 inválido, use formato colombiano'),
  telefono2: z
    .string()
    .trim()
    .regex(telefonoRegex, 'telefono2 inválido, use formato colombiano')
    .optional()
    .or(z.literal(''))
    .default(''),
  autorizaTratamientoDatos: z.literal(true, {
    message: 'Debe autorizar el tratamiento de datos personales',
  }),
});

export const marcarEncontradaSchema = z.object({
  editToken: z.string().uuid('editToken inválido'),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Contraseña requerida'),
});

export const adminEstadoSchema = z.object({
  estado: z.enum(['perdida', 'encontrada']),
});

// 'perdida'/'rescatada' fijan el tipoReporte y ponen estado=perdida (caso activo);
// 'encontrada' solo cambia el estado, sin tocar el tipoReporte (ya está con su familia).
export const adminTipoSchema = z.object({
  tipo: z.enum(['perdida', 'rescatada', 'encontrada']),
});

export const adminValidacionSchema = z.object({
  validacion: z.enum(['pendiente', 'aprobada', 'rechazada']),
});

export const crearComunidadSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido').max(80),
  descripcion: z.string().trim().max(300).optional().default(''),
  lat: z.number().min(LAT_MIN).max(LAT_MAX),
  lng: z.number().min(LNG_MIN).max(LNG_MAX),
});

export const vincularComunidadSchema = z.object({
  comunidadId: z.string().uuid('comunidadId inválido').nullable(),
});

export const presignSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z
    .string()
    .refine((v) => v.startsWith('image/'), 'contentType debe ser una imagen'),
});
