import request from 'supertest';
import { crearApp } from '../app';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    comunidad: {
      findMany: jest.fn(),
    },
    mascota: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const app = crearApp();
const mockPrisma = prisma as unknown as {
  comunidad: {
    findMany: jest.Mock;
  };
  mascota: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/comunidades', () => {
  it('lista las comunidades con la cantidad de mascotas visibles', async () => {
    mockPrisma.comunidad.findMany.mockResolvedValue([
      {
        id: 'com-1',
        nombre: 'Barrio Las Flores',
        descripcion: 'Zona afectada',
        lat: 4.5,
        lng: -75.6,
        _count: { mascotas: 3 },
      },
    ]);

    const res = await request(app).get('/api/comunidades');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 'com-1',
        nombre: 'Barrio Las Flores',
        descripcion: 'Zona afectada',
        lat: 4.5,
        lng: -75.6,
        cantidadMascotas: 3,
      },
    ]);
    expect(mockPrisma.comunidad.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { mascotas: { where: { validacion: { not: 'rechazada' } } } } },
      },
    });
  });
});

describe('GET /api/comunidades/:id/mascotas', () => {
  it('retorna las mascotas de esa comunidad, paginadas', async () => {
    mockPrisma.mascota.findMany.mockResolvedValue([{ id: '1', comunidadId: 'com-1' }]);
    mockPrisma.mascota.count.mockResolvedValue(1);

    const res = await request(app).get('/api/comunidades/com-1/mascotas');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(mockPrisma.mascota.findMany).toHaveBeenCalledWith({
      where: { comunidadId: 'com-1', validacion: { not: 'rechazada' } },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 50,
    });
  });
});
