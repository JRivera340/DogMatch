import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { crearMascotaSchema, marcarEncontradaSchema } from '../validation';
import { envolverPaginado, leerPaginacion } from '../pagination';

export const mascotasRouter = Router();

mascotasRouter.get('/', async (req, res) => {
  // Endpoint público: incluye perdidas y encontradas (transparencia de casos resueltos),
  // pero nunca reportes rechazados por un admin. El caso aparece de inmediato al publicarse
  // con validacion="pendiente"; el filtro por estado/validación se aplica en el cliente.
  // Paginado para no sobrecargar la página con datasets grandes.
  const paginacion = leerPaginacion(req, 50, 100);
  const where = { validacion: { not: 'rechazada' } };

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

mascotasRouter.post('/', async (req, res) => {
  const parsed = crearMascotaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const editToken = randomUUID();
  const mascota = await prisma.mascota.create({
    data: {
      ...parsed.data,
      ultimaVezFecha: new Date(parsed.data.ultimaVezFecha),
      editToken,
    },
  });

  res.status(201).json({ id: mascota.id, editToken });
});

mascotasRouter.patch('/:id/encontrada', async (req, res) => {
  const parsed = marcarEncontradaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const mascota = await prisma.mascota.findUnique({ where: { id: req.params.id } });
  if (!mascota) {
    res.status(404).json({ error: 'Mascota no encontrada' });
    return;
  }
  if (mascota.editToken !== parsed.data.editToken) {
    res.status(403).json({ error: 'editToken inválido' });
    return;
  }

  const actualizada = await prisma.mascota.update({
    where: { id: req.params.id },
    data: { estado: 'encontrada' },
  });

  res.json({ id: actualizada.id, estado: actualizada.estado });
});
