import { Router } from 'express';
import { presignSchema } from '../validation';
import { crearPresignedUploadUrl, S3NoConfiguradoError } from '../s3';

export const uploadsRouter = Router();

uploadsRouter.post('/presign', async (req, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
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
