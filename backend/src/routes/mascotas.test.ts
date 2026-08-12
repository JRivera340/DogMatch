import request from 'supertest';
import { randomUUID } from 'crypto';
import { crearApp } from '../app';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    mascota: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const app = crearApp();
const mockPrisma = prisma as unknown as {
  mascota: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const mascotaValida = {
  nombre: 'Firulais',
  especie: 'Perro',
  raza: 'Criollo',
  genero: 'Macho',
  color: 'Café',
  fotoUrl: 'https://bucket.s3.amazonaws.com/mascotas/foto.jpg',
  ultimaVezFecha: new Date(Date.now() - 3600_000).toISOString(),
  ultimaVezLugarTexto: 'Parque principal, Armenia',
  lat: 4.534,
  lng: -75.681,
  lugarResidencia: 'Cra 10 #5-20, Armenia',
  telefono1: '3001234567',
  telefono2: '3007654321',
  autorizaTratamientoDatos: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/mascotas', () => {
  it('retorna todas las mascotas (perdidas y encontradas)', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([
      { id: '1', estado: 'perdida' },
      { id: '2', estado: 'encontrada' },
    ]);

    const res = await request(app).get('/api/mascotas');

    expect(res.status).toBe(200);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(res.body).toEqual([
      { id: '1', estado: 'perdida' },
      { id: '2', estado: 'encontrada' },
    ]);
  });
});

describe('POST /api/mascotas', () => {
  it('rechaza payload sin autorización de tratamiento de datos', async () => {
    const { autorizaTratamientoDatos, ...sinAutorizacion } = mascotaValida;

    const res = await request(app).post('/api/mascotas').send(sinAutorizacion);

    expect(res.status).toBe(400);
    expect(mockPrisma.mascota.create).not.toHaveBeenCalled();
  });

  it('rechaza teléfono con formato inválido', async () => {
    const res = await request(app)
      .post('/api/mascotas')
      .send({ ...mascotaValida, telefono1: '123' });

    expect(res.status).toBe(400);
  });

  it('crea la mascota y retorna id + editToken', async () => {
    mockPrisma.mascota.create.mockResolvedValue({
      id: 'mascota-1',
      editToken: 'token-1',
    });

    const res = await request(app).post('/api/mascotas').send(mascotaValida);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('editToken');
    expect(mockPrisma.mascota.create).toHaveBeenCalledTimes(1);
  });
});

describe('PATCH /api/mascotas/:id/encontrada', () => {
  it('rechaza editToken incorrecto con 403', async () => {
    mockPrisma.mascota.findUnique.mockResolvedValue({
      id: 'mascota-1',
      editToken: 'token-correcto',
    });

    const res = await request(app)
      .patch('/api/mascotas/mascota-1/encontrada')
      .send({ editToken: randomUUID() });

    expect(res.status).toBe(403);
    expect(mockPrisma.mascota.update).not.toHaveBeenCalled();
  });

  it('marca como encontrada con editToken correcto', async () => {
    const editToken = randomUUID();
    mockPrisma.mascota.findUnique.mockResolvedValue({ id: 'mascota-1', editToken });
    mockPrisma.mascota.update.mockResolvedValue({ id: 'mascota-1', estado: 'encontrada' });

    const res = await request(app)
      .patch('/api/mascotas/mascota-1/encontrada')
      .send({ editToken });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'mascota-1', estado: 'encontrada' });
  });

  it('retorna 404 si la mascota no existe', async () => {
    mockPrisma.mascota.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/mascotas/no-existe/encontrada')
      .send({ editToken: randomUUID() });

    expect(res.status).toBe(404);
  });
});
