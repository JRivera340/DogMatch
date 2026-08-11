import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const region = process.env.AWS_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET_NAME ?? '';
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL ?? '';

export class S3NoConfiguradoError extends Error {
  constructor() {
    super('El almacenamiento de fotos (S3) todavía no está configurado en el servidor');
    this.name = 'S3NoConfiguradoError';
  }
}

function s3Configurado(): boolean {
  return Boolean(
    bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
  );
}

const s3Client = new S3Client({ region });

export async function crearPresignedUploadUrl(filename: string, contentType: string) {
  if (!s3Configurado()) {
    throw new S3NoConfiguradoError();
  }

  const extension = filename.includes('.') ? filename.split('.').pop() : 'jpg';
  const key = `mascotas/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
}
