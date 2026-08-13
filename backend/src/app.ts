import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import { mascotasRouter } from './routes/mascotas';
import { uploadsRouter } from './routes/uploads';
import { adminRouter } from './routes/admin';

export function crearApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use('/api/mascotas', mascotasRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/admin', adminRouter);

  const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  };
  app.use(manejarErrores);

  return app;
}
