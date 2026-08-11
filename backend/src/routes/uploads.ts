import { Router } from 'express';
import { presignSchema } from '../validation';
import { crearPresignedUploadUrl } from '../s3';

export const uploadsRouter = Router();

uploadsRouter.post('/presign', async (req, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uploadUrl, publicUrl, key } = await crearPresignedUploadUrl(
    parsed.data.filename,
    parsed.data.contentType,
  );

  res.json({ uploadUrl, publicUrl, key });
});
