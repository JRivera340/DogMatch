import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { crearMascotaSchema, marcarEncontradaSchema } from '../validation';

export const mascotasRouter = Router();

mascotasRouter.get('/', async (_req, res) => {
  // Endpoint público: incluye perdidas y encontradas (transparencia de casos resueltos),
  // pero nunca reportes rechazados por un admin. El caso aparece de inmediato al publicarse
  // con validacion="pendiente"; el filtro por estado/validación se aplica en el cliente.
  const mascotas = await prisma.mascota.findMany({
    where: { validacion: { not: 'rechazada' } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(mascotas);
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
