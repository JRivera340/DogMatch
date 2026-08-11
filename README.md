# DogMatch

Plataforma para reportar y buscar mascotas perdidas en Colombia, con mapa interactivo, foto en S3 y contacto directo vía WhatsApp.

## Estructura

- `frontend/` — React + Vite + TailwindCSS + React-Leaflet
- `backend/` — Node.js + Express + Prisma (PostgreSQL)
- `docs/superpowers/specs/` — documento de diseño

## Desarrollo local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completa DATABASE_URL y credenciales S3
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # apunta VITE_API_URL al backend local
npm run dev
```

## Tests

```bash
cd backend && npm test
cd frontend && npx vitest run
```

## Despliegue

Desplegado en Railway: PostgreSQL, servicio `backend` y servicio `frontend`. El almacenamiento de fotos usa un bucket S3 externo — configura las variables `AWS_*` y `S3_BUCKET_NAME` en el servicio `backend` una vez tengas el bucket creado.

<!-- autodeploy test 2026-08-11T04:34:53Z -->
