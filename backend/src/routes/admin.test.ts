import request from 'supertest';
import jwt from 'jsonwebtoken';
import { crearApp } from '../app';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    mascota: {
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  mascota: {
    findMany: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
};

process.env.ADMIN_PASSWORD = 'clave-de-prueba';
process.env.JWT_SECRET = 'secreto-de-prueba';

const app = crearApp();

function tokenValido() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/admin/login', () => {
  it('rechaza contraseña incorrecta con 401', async () => {
    const res = await request(app).post('/api/admin/login').send({ password: 'incorrecta' });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('rechaza body sin contraseña con 400', async () => {
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.status).toBe(400);
  });

  it('retorna un token válido con la contraseña correcta', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: 'clave-de-prueba' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string);
    expect(payload).toMatchObject({ role: 'admin' });
  });
});

describe('rutas admin protegidas', () => {
  it('GET /api/admin/mascotas rechaza sin token con 401', async () => {
    const res = await request(app).get('/api/admin/mascotas');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/mascotas rechaza token inválido con 401', async () => {
    const res = await request(app)
      .get('/api/admin/mascotas')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/mascotas retorna todas las mascotas con token válido', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([
      { id: '1', estado: 'perdida' },
      { id: '2', estado: 'encontrada' },
    ]);

    const res = await request(app)
      .get('/api/admin/mascotas')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('DELETE /api/admin/mascotas/:id elimina sin necesitar editToken', async () => {
    mockPrisma.mascota.delete.mockResolvedValue({ id: '1' });

    const res = await request(app)
      .delete('/api/admin/mascotas/1')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(204);
    expect(mockPrisma.mascota.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('DELETE /api/admin/mascotas/:id retorna 404 si no existe', async () => {
    mockPrisma.mascota.delete.mockRejectedValue(new Error('not found'));

    const res = await request(app)
      .delete('/api/admin/mascotas/no-existe')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /api/admin/mascotas/:id/estado fuerza el estado sin editToken', async () => {
    mockPrisma.mascota.update.mockResolvedValue({ id: '1', estado: 'encontrada' });

    const res = await request(app)
      .patch('/api/admin/mascotas/1/estado')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ estado: 'encontrada' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', estado: 'encontrada' });
  });

  it('PATCH /api/admin/mascotas/:id/estado rechaza estado inválido con 400', async () => {
    const res = await request(app)
      .patch('/api/admin/mascotas/1/estado')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ estado: 'perdido-mal-escrito' });

    expect(res.status).toBe(400);
    expect(mockPrisma.mascota.update).not.toHaveBeenCalled();
  });
});
