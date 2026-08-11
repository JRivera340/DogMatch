import express from 'express';
import cors from 'cors';
import { mascotasRouter } from './routes/mascotas';
import { uploadsRouter } from './routes/uploads';

export function crearApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/mascotas', mascotasRouter);
  app.use('/api/uploads', uploadsRouter);

  return app;
}
