import { Router } from 'express';
import express from 'express';
import { presignSchema } from '../validation';
import { crearPresignedUploadUrl, S3NoConfiguradoError } from '../s3';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export const uploadsRouter = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

uploadsRouter.post('/presign', async (req, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const filename = `${randomUUID()}-${parsed.data.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadUrl = `http://localhost:${process.env.PORT || 4000}/api/uploads/local/${filename}`;
    const publicUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${filename}`;
    res.json({ uploadUrl, publicUrl, key: filename });
    return;
  }

  try {
    const { uploadUrl, publicUrl, key } = await crearPresignedUploadUrl(
      parsed.data.filename,
      parsed.data.contentType,
    );
    res.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    if (error instanceof S3NoConfiguradoError) {
      res.status(503).json({ error: error.message });
      return;
    }
    res.status(502).json({ error: 'No se pudo generar la URL de subida' });
  }
});

uploadsRouter.put('/local/:filename', express.raw({ type: '*/*', limit: '10mb' }), (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  fs.writeFile(filePath, req.body, (err) => {
    if (err) {
      console.error('Error guardando archivo local:', err);
      res.status(500).json({ error: 'Error guardando archivo local' });
      return;
    }
    res.json({ ok: true });
  });
});

