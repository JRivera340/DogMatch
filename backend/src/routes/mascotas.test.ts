import request from 'supertest';
import { randomUUID } from 'crypto';
import { crearApp } from '../app';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    mascota: {
      findMany: jest.fn(),
      count: jest.fn(),
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
    count: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const mascotaValida = {
  nombre: 'Firulais',
  tipoReporte: 'perdida',
  especie: 'Perro',
  raza: 'Criollo',
  genero: 'Macho',
  color: 'Café',
  tamano: 'Mediano',
  edad: 'Adulto',
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
  it('retorna todas las mascotas paginadas (perdidas y encontradas)', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([
      { id: '1', estado: 'perdida' },
      { id: '2', estado: 'encontrada' },
    ]);
    mockPrisma.mascota.count.mockResolvedValue(2);

    const res = await request(app).get('/api/mascotas');

    expect(res.status).toBe(200);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      where: { validacion: { not: 'rechazada' } },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 50,
    });
    expect(res.body).toEqual({
      items: [
        { id: '1', estado: 'perdida' },
        { id: '2', estado: 'encontrada' },
      ],
      page: 1,
      pageSize: 50,
      total: 2,
      totalPages: 1,
    });
  });

  it('respeta page y pageSize de la query, con tope máximo', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([]);
    mockPrisma.mascota.count.mockResolvedValue(500);

    const res = await request(app).get('/api/mascotas?page=2&pageSize=999');

    expect(res.status).toBe(200);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      where: { validacion: { not: 'rechazada' } },
      orderBy: { createdAt: 'desc' },
      skip: 100, // (page 2 - 1) * pageSize tope (100)
      take: 100,
    });
    expect(res.body.pageSize).toBe(100);
    expect(res.body.totalPages).toBe(5);
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

  it('rechaza tamaño fuera de las 3 opciones válidas', async () => {
    const res = await request(app)
      .post('/api/mascotas')
      .send({ ...mascotaValida, tamano: 'Extra grande' });

    expect(res.status).toBe(400);
  });

  it('rechaza una seña que no está en la lista fija', async () => {
    const res = await request(app)
      .post('/api/mascotas')
      .send({ ...mascotaValida, senas: ['Tiene tres colas'] });

    expect(res.status).toBe(400);
  });

  it('acepta señas de la lista fija y los checkboxes de alerta', async () => {
    mockPrisma.mascota.create.mockResolvedValue({ id: 'mascota-2', editToken: 'token-2' });

    const res = await request(app)
      .post('/api/mascotas')
      .send({
        ...mascotaValida,
        senas: ['Lleva collar', 'Cojea'],
        otrasSenas: 'Mancha en forma de corazón',
        esUrgente: true,
        esAsustadiza: true,
      });

    expect(res.status).toBe(201);
    expect(mockPrisma.mascota.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          senas: ['Lleva collar', 'Cojea'],
          esUrgente: true,
          esAsustadiza: true,
        }),
      }),
    );
  });

  it('usa valores por defecto cuando no se envían señas ni alertas', async () => {
    mockPrisma.mascota.create.mockResolvedValue({ id: 'mascota-3', editToken: 'token-3' });

    const res = await request(app).post('/api/mascotas').send(mascotaValida);

    expect(res.status).toBe(201);
    expect(mockPrisma.mascota.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          senas: [],
          senasParticulares: '',
          otrasSenas: '',
          esUrgente: false,
          esAsustadiza: false,
        }),
      }),
    );
  });

  it('rechaza tipoReporte inválido', async () => {
    const res = await request(app)
      .post('/api/mascotas')
      .send({ ...mascotaValida, tipoReporte: 'adoptada' });

    expect(res.status).toBe(400);
    expect(mockPrisma.mascota.create).not.toHaveBeenCalled();
  });

  it('acepta tipoReporte "rescatada" (mascota sin dueño)', async () => {
    mockPrisma.mascota.create.mockResolvedValue({ id: 'mascota-4', editToken: 'token-4' });

    const res = await request(app)
      .post('/api/mascotas')
      .send({ ...mascotaValida, tipoReporte: 'rescatada' });

    expect(res.status).toBe(201);
    expect(mockPrisma.mascota.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tipoReporte: 'rescatada' }),
      }),
    );
  });
});

describe('POST /api/mascotas/:id/click', () => {
  it('incrementa el contador de clicks', async () => {
    mockPrisma.mascota.update.mockResolvedValue({ id: 'mascota-1', clicks: 4 });

    const res = await request(app).post('/api/mascotas/mascota-1/click');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ clicks: 4 });
    expect(mockPrisma.mascota.update).toHaveBeenCalledWith({
      where: { id: 'mascota-1' },
      data: { clicks: { increment: 1 } },
    });
  });

  it('retorna 404 si la mascota no existe', async () => {
    mockPrisma.mascota.update.mockRejectedValue(new Error('not found'));

    const res = await request(app).post('/api/mascotas/no-existe/click');

    expect(res.status).toBe(404);
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
