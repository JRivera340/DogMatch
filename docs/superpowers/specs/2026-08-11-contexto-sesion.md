# DogMatch — Contexto para continuar en nuevo chat

## Qué es

Plataforma web para reportar y buscar mascotas perdidas en Colombia (contexto: personas afectadas por un sismo). Sin login: cualquiera publica un reporte con foto, ubicación en mapa y datos de contacto. Otros usuarios navegan el mapa para reconocer mascotas y contactar directamente por WhatsApp o llamada.

## Arquitectura

Monorepo con dos apps independientes + infraestructura en Railway:

- **`frontend/`** — React 19 + Vite + TypeScript + TailwindCSS v4 + React-Leaflet (mapas). Sitio estático, servido por Railpack (detección automática, sin servidor Node).
- **`backend/`** — Node.js + Express 5 + TypeScript + Prisma 6 (ORM) + Zod (validación). API REST.
- **PostgreSQL** — base de datos gestionada por Railway (plugin nativo).
- **S3** — almacenamiento de fotos de mascotas. Backend genera presigned URLs; el navegador sube la foto directo a S3 (no pasa por el backend). **Bucket externo AWS aún no creado — pendiente, ver abajo.**

Flujo: usuario entra a `/` → ve mapa Leaflet con pines rojos de mascotas activas (`estado="perdida"`) → click "Reportar mascota" → llena formulario en 3 secciones → sube foto a S3 vía presigned URL → backend crea el registro en Postgres → pin aparece en el mapa.

## Modelo de datos (Prisma)

Tabla única `Mascota`: nombre, raza, género, fotoUrl, fecha/lugar visto por última vez, lat/lng, lugar de residencia del dueño, dos teléfonos de contacto, estado (perdida/encontrada), `editToken` (UUID devuelto solo al crear — permite marcar "encontrada" sin login, guardado en `localStorage` del navegador), autorización de tratamiento de datos (Ley 1581/2012 Colombia).

## API (backend)

- `GET /api/mascotas` — lista mascotas con estado "perdida"
- `POST /api/mascotas` — crea reporte, retorna `{ id, editToken }`
- `PATCH /api/mascotas/:id/encontrada` — marca encontrada (requiere editToken correcto)
- `POST /api/uploads/presign` — genera presigned URL de S3 pa subir foto

## Diseño visual

Identidad "sello oficial de rescate": rojo profundo `#c81e3a` (no rojo genérico), tipografía Archivo (display/headers) + Inter (cuerpo) + IBM Plex Mono (códigos de caso, teléfonos). Cards de mascota estilo ficha oficial: foto + sello rotado "Perdida" + línea perforada + código de caso corto. Formulario dividido en 3 secciones numeradas tipo expediente (Datos de la mascota / Última vez vista / Contacto y residencia). Aviso de datos personales con borde-cita roja.

## Estado actual — ya hecho

1. Scaffold completo frontend + backend, tests pasando (backend: 9/9 Jest+Supertest; frontend: 5/5 Vitest+Testing Library).
2. Backend desplegado en Railway: `https://backend-production-4b81.up.railway.app` (health check en `/health`).
3. Frontend desplegado en Railway: `https://frontend-production-df9c.up.railway.app`.
4. Postgres provisto en Railway, schema sincronizado vía `prisma db push` (corre automáticamente en el `start` script del backend).
5. Repo en GitHub: `JRivera340/DogMatch`, rama `main`. Ambos servicios de Railway están conectados a este repo con `rootDirectory` configurado (`/backend`, `/frontend`) — **cada push a `main` dispara autodeploy en Railway automáticamente**, ya verificado funcionando.
6. Rediseño visual completo aplicado y desplegado (ver sección Diseño visual arriba).
7. Documento de diseño original: `docs/superpowers/specs/2026-08-10-dogmatch-design.md`.

## Pendiente

- **Bucket S3**: el usuario dijo que lo crea él mismo en su cuenta AWS (no usamos el bucket nativo de Railway, se decidió S3 externo). Cuando lo tenga, hay que configurar estas variables en el servicio `backend` de Railway:
  ```
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  S3_BUCKET_NAME
  S3_PUBLIC_BASE_URL   (opcional, si no se pasa cae a *.s3.<region>.amazonaws.com)
  ```
  Sin esto, el paso de subir foto en `/reportar` falla (presign). El resto del flujo (mapa, cards, WhatsApp, marcar encontrada) ya funciona en producción.
- No hay panel de moderación (decisión explícita del usuario, "no por ahora").
- No hay migraciones de Prisma formales (`prisma/migrations/`) — se usa `db push` directo, válido para este proyecto pero sin historial de cambios de schema.

## IDs de Railway (para referencia rápida)

- Proyecto: `dogmatch` — `3e81ed1a-7d6b-4867-af33-6e9ab8182ddd`
- Environment: `production` — `d0720546-4109-49ea-bcd1-5f35fb5569ad`
- Servicio backend: `7fc91e5f-a277-4fa7-80b4-98b52499454d`
- Servicio frontend: `e0128944-868c-43fa-97e3-3441b1303d0b`
- Servicio Postgres: `a716e550-1f93-46d6-be56-5986c4a2c53b`
- Dashboard: https://railway.com/project/3e81ed1a-7d6b-4867-af33-6e9ab8182ddd

## Herramientas usadas en esta sesión

- Skill `superpowers:brainstorming` para diseño inicial (spec en `docs/superpowers/specs/`)
- Skill `use-railway` + MCP de Railway (`mcp__railway__*`) para toda la infraestructura
- Skill `frontend-design` para el rediseño visual
- CLI de Railway (`railway`) y `gh` (GitHub CLI) para push/verificación

## Cómo retomar

Decirle a Claude: "sigue con DogMatch en `C:\Users\river\Desktop\DogMatch`, lee `docs/superpowers/specs/2026-08-11-contexto-sesion.md`". Con eso tiene toda la arquitectura, decisiones y pendientes sin tener que re-explorar el repo desde cero.
