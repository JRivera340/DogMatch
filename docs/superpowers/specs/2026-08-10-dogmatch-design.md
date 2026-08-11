# DogMatch — Plataforma de identificación de mascotas perdidas (Colombia)

## Contexto

Tras un sismo en Colombia, muchas mascotas se pierden de sus hogares. Se necesita una página web pública, sin fricción de registro, donde cualquier persona pueda reportar una mascota perdida (con ubicación en un mapa, datos de contacto y foto) y donde otras personas puedan buscar en el mapa a ver si reconocen una mascota que encontraron. La prioridad es velocidad de publicación (sin login) y facilidad de contacto inmediato (WhatsApp / llamada).

## Arquitectura

Monorepo con tres piezas, todas desplegadas en Railway:

- **frontend/** — React (Vite) + TailwindCSS + React-Leaflet. Servido como sitio estático.
- **backend/** — Node.js + Express + Prisma, API REST.
- **PostgreSQL** — plugin nativo de Railway.
- **S3** — bucket dedicado solo a fotos de mascotas. El backend genera presigned URLs; el frontend sube el archivo directo a S3 (no pasa por el backend).

Flujo: usuario abre la página → ve mapa Leaflet con pines rojos de mascotas activas (`estado = "perdida"`) → click en "Reportar mascota" → llena formulario → sube foto directo a S3 vía presigned URL → backend crea el registro en Postgres → el pin aparece en el mapa.

## Modelo de datos (Prisma / PostgreSQL)

```prisma
model Mascota {
  id                        String   @id @default(uuid())
  nombre                    String
  raza                      String
  genero                    String   // "Macho" | "Hembra"
  fotoUrl                   String   // URL pública/S3 key de la foto
  ultimaVezFecha             DateTime
  ultimaVezLugarTexto        String   // descripción legible del lugar visto
  lat                       Float
  lng                       Float
  lugarResidencia            String   // dirección/barrio de la persona, para saber a dónde ir si se encuentra
  telefono1                 String
  telefono2                 String   // segundo número obligatorio
  estado                    String   @default("perdida") // "perdida" | "encontrada"
  editToken                 String   @unique // token secreto devuelto solo al crear, permite marcar "encontrada" sin login
  autorizaTratamientoDatos   Boolean  // debe ser true, checkbox obligatorio en el form
  createdAt                 DateTime @default(now())
}
```

- `editToken`: UUID aleatorio devuelto una única vez en la respuesta de `POST /api/mascotas`. El frontend lo guarda en `localStorage`. El botón "Marcar como encontrada" en la card del propio publicador se habilita comparando contra el token guardado localmente.

## API (Express)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mascotas` | Lista mascotas con `estado = "perdida"` (para pines del mapa y cards) |
| POST | `/api/mascotas` | Crea un registro. Retorna `{ id, editToken }` |
| PATCH | `/api/mascotas/:id/encontrada` | Body `{ editToken }`. Marca `estado = "encontrada"` si el token coincide |
| POST | `/api/uploads/presign` | Body `{ filename, contentType }`. Retorna presigned PUT URL de S3 |

Validación en backend con Zod:
- Todos los campos obligatorios presentes.
- Dos teléfonos en formato colombiano (+57 / 10 dígitos).
- `autorizaTratamientoDatos === true` obligatorio (rechaza si falta o es `false`).
- `ultimaVezFecha` no puede ser futura.
- `lat`/`lng` dentro del rango geográfico de Colombia.

## Frontend (React + Tailwind + React-Leaflet)

**Paleta**: rojo primario `#DC2626`, rojo oscuro `#7F1D1D`, fondo suave `#FEE2E2`, blanco y gris carbón para texto. Tema de "alerta/ayuda", no agresivo.

**Páginas**:
- `/` — mapa Leaflet + lista de cards de mascotas perdidas.
- `/reportar` — formulario multi-paso: datos de la mascota → ubicación (click en mini-mapa) → foto → checkbox de autorización de datos.

**Componentes clave**:
- `MapaMascotas` — Leaflet, pines rojos, popup con mini-card al hacer click.
- `MascotaCard` — foto, datos completos, botón "Contactar por WhatsApp" (`wa.me/57...`) para cada teléfono, y botón "Copiar número" (`navigator.clipboard`).
- `FormReportar` — formulario multi-paso con validación en cliente (mismas reglas que backend).
- `AvisoTratamientoDatos` — checkbox obligatorio (no se puede enviar el form sin marcarlo) + modal con el texto legal completo, alineado a la Ley 1581 de 2012 (Habeas Data, Colombia).

**Responsive**: en móvil, mapa full-width arriba y cards en scroll debajo; en desktop, mapa ocupa 60% y sidebar de cards 40%.

## Aviso de tratamiento de datos

Checkbox obligatorio en el formulario de reporte; el botón de envío permanece deshabilitado hasta marcarlo. Incluye enlace "Leer más" que abre un modal con el aviso completo de tratamiento de datos personales conforme a la Ley 1581 de 2012. El valor `true` se persiste en el registro como evidencia del consentimiento otorgado.

## Testing

- **Backend**: Jest + Supertest sobre las rutas de la API — validación de campos, creación exitosa, marcar "encontrada" con token correcto e incorrecto.
- **Frontend**: Vitest + Testing Library — validación de `FormReportar` (campos obligatorios, checkbox de autorización) y render correcto de botones de contacto en `MascotaCard`.

## Despliegue (Railway)

- Servicio `backend` (Express) conectado a Postgres vía variable de referencia.
- Servicio `frontend` (build estático de Vite) servido por Railway.
- Variables de entorno: credenciales S3 (bucket, región, access key, secret key), `DATABASE_URL` (autogenerada por Railway), `PORT`.
- Dominio autogenerado por Railway para ambos servicios (o dominio custom si el usuario lo solicita luego).
