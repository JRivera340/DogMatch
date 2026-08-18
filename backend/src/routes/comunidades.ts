import { Router } from 'express';
import { prisma } from '../prisma';
import { envolverPaginado, leerPaginacion } from '../pagination';

export const comunidadesRouter = Router();

comunidadesRouter.get('/', async (_req, res) => {
  // Público: para pintar los puntos de comunidad en el mapa, con la cantidad
  // de mascotas visibles (misma regla que /api/mascotas: sin las rechazadas).
  const comunidades = await prisma.comunidad.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { mascotas: { where: { validacion: { not: 'rechazada' } } } } },
    },
  });

  res.json(
    comunidades.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      lat: c.lat,
      lng: c.lng,
      cantidadMascotas: c._count.mascotas,
    })),
  );
});

comunidadesRouter.get('/:id/mascotas', async (req, res) => {
  const id = String(req.params.id);
  const paginacion = leerPaginacion(req, 50, 100);
  const where = { comunidadId: id, validacion: { not: 'rechazada' as const } };

  const [items, total] = await Promise.all([
    prisma.mascota.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: paginacion.skip,
      take: paginacion.take,
    }),
    prisma.mascota.count({ where }),
  ]);

  res.json(envolverPaginado(items, total, paginacion));
});
