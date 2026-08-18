import request from 'supertest';
import jwt from 'jsonwebtoken';
import { crearApp } from '../app';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    mascota: {
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    comunidad: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  mascota: {
    findMany: jest.Mock;
    count: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  comunidad: {
    create: jest.Mock;
    delete: jest.Mock;
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

  it('GET /api/admin/mascotas retorna todas las mascotas paginadas con token válido', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([
      { id: '1', estado: 'perdida' },
      { id: '2', estado: 'encontrada' },
    ]);
    mockPrisma.mascota.count.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/admin/mascotas')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 100,
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

  it('PATCH /api/admin/mascotas/:id/tipo fija rescatada y estado=perdida', async () => {
    mockPrisma.mascota.update.mockResolvedValue({
      id: '1',
      tipoReporte: 'rescatada',
      estado: 'perdida',
    });

    const res = await request(app)
      .patch('/api/admin/mascotas/1/tipo')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ tipo: 'rescatada' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', tipoReporte: 'rescatada', estado: 'perdida' });
    expect(mockPrisma.mascota.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { tipoReporte: 'rescatada', estado: 'perdida' },
    });
  });

  it('PATCH /api/admin/mascotas/:id/tipo con encontrada solo cambia el estado', async () => {
    mockPrisma.mascota.update.mockResolvedValue({
      id: '1',
      tipoReporte: 'rescatada',
      estado: 'encontrada',
    });

    const res = await request(app)
      .patch('/api/admin/mascotas/1/tipo')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ tipo: 'encontrada' });

    expect(res.status).toBe(200);
    expect(mockPrisma.mascota.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { estado: 'encontrada' },
    });
  });

  it('PATCH /api/admin/mascotas/:id/tipo rechaza valor inválido con 400', async () => {
    const res = await request(app)
      .patch('/api/admin/mascotas/1/tipo')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ tipo: 'algo-invalido' });

    expect(res.status).toBe(400);
    expect(mockPrisma.mascota.update).not.toHaveBeenCalled();
  });

  it('POST /api/admin/comunidades crea una comunidad', async () => {
    mockPrisma.comunidad.create.mockResolvedValue({
      id: 'com-1',
      nombre: 'Barrio Las Flores',
      descripcion: '',
      lat: 4.5,
      lng: -75.6,
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/admin/comunidades')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ nombre: 'Barrio Las Flores', lat: 4.5, lng: -75.6 });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Barrio Las Flores');
    expect(mockPrisma.comunidad.create).toHaveBeenCalledWith({
      data: { nombre: 'Barrio Las Flores', descripcion: '', lat: 4.5, lng: -75.6 },
    });
  });

  it('POST /api/admin/comunidades rechaza sin token con 401', async () => {
    const res = await request(app)
      .post('/api/admin/comunidades')
      .send({ nombre: 'X', lat: 4.5, lng: -75.6 });

    expect(res.status).toBe(401);
    expect(mockPrisma.comunidad.create).not.toHaveBeenCalled();
  });

  it('POST /api/admin/comunidades rechaza coordenadas fuera de rango con 400', async () => {
    const res = await request(app)
      .post('/api/admin/comunidades')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ nombre: 'X', lat: 90, lng: -75.6 });

    expect(res.status).toBe(400);
    expect(mockPrisma.comunidad.create).not.toHaveBeenCalled();
  });

  it('DELETE /api/admin/comunidades/:id elimina la comunidad', async () => {
    mockPrisma.comunidad.delete.mockResolvedValue({ id: 'com-1' });

    const res = await request(app)
      .delete('/api/admin/comunidades/com-1')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(204);
    expect(mockPrisma.comunidad.delete).toHaveBeenCalledWith({ where: { id: 'com-1' } });
  });

  it('DELETE /api/admin/comunidades/:id retorna 404 si no existe', async () => {
    mockPrisma.comunidad.delete.mockRejectedValue(new Error('not found'));

    const res = await request(app)
      .delete('/api/admin/comunidades/no-existe')
      .set('Authorization', `Bearer ${tokenValido()}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /api/admin/mascotas/:id/validacion aprueba un caso', async () => {
    mockPrisma.mascota.update.mockResolvedValue({ id: '1', validacion: 'aprobada' });

    const res = await request(app)
      .patch('/api/admin/mascotas/1/validacion')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ validacion: 'aprobada' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', validacion: 'aprobada' });
    expect(mockPrisma.mascota.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { validacion: 'aprobada' },
    });
  });

  it('PATCH /api/admin/mascotas/:id/validacion rechaza un caso', async () => {
    mockPrisma.mascota.update.mockResolvedValue({ id: '1', validacion: 'rechazada' });

    const res = await request(app)
      .patch('/api/admin/mascotas/1/validacion')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ validacion: 'rechazada' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', validacion: 'rechazada' });
  });

  it('PATCH /api/admin/mascotas/:id/validacion rechaza valor inválido con 400', async () => {
    const res = await request(app)
      .patch('/api/admin/mascotas/1/validacion')
      .set('Authorization', `Bearer ${tokenValido()}`)
      .send({ validacion: 'algo-invalido' });

    expect(res.status).toBe(400);
    expect(mockPrisma.mascota.update).not.toHaveBeenCalled();
  });

  it('PATCH /api/admin/mascotas/:id/validacion sin token retorna 401', async () => {
    const res = await request(app)
      .patch('/api/admin/mascotas/1/validacion')
      .send({ validacion: 'aprobada' });

    expect(res.status).toBe(401);
  });
});
