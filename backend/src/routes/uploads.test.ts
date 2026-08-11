import request from 'supertest';
import { crearApp } from '../app';
import { crearPresignedUploadUrl } from '../s3';

jest.mock('../s3', () => ({
  crearPresignedUploadUrl: jest.fn(),
}));

jest.mock('../prisma', () => ({ prisma: {} }));

const app = crearApp();
const mockCrearPresignedUploadUrl = crearPresignedUploadUrl as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/uploads/presign', () => {
  it('rechaza contentType que no sea imagen', async () => {
    const res = await request(app)
      .post('/api/uploads/presign')
      .send({ filename: 'foto.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(mockCrearPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it('retorna uploadUrl y publicUrl para imagen válida', async () => {
    mockCrearPresignedUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      publicUrl: 'https://s3.example.com/public/foto.jpg',
      key: 'mascotas/foto.jpg',
    });

    const res = await request(app)
      .post('/api/uploads/presign')
      .send({ filename: 'foto.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBeDefined();
    expect(res.body.publicUrl).toBeDefined();
  });
});
