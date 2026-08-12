import { Router } from 'express';
import { prisma } from '../prisma';
import { adminEstadoSchema, adminLoginSchema, adminValidacionSchema } from '../validation';
import { firmarTokenAdmin, requireAdmin } from '../adminAuth';

export const adminRouter = Router();

adminRouter.post('/login', (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const claveConfigurada = process.env.ADMIN_PASSWORD;
  if (!claveConfigurada) {
    res.status(500).json({ error: 'ADMIN_PASSWORD no configurado en el servidor' });
    return;
  }

  if (parsed.data.password !== claveConfigurada) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  res.json({ token: firmarTokenAdmin() });
});

adminRouter.get('/mascotas', requireAdmin, async (_req, res) => {
  const mascotas = await prisma.mascota.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(mascotas);
});

adminRouter.delete('/mascotas/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  try {
    await prisma.mascota.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Mascota no encontrada' });
  }
});

adminRouter.patch('/mascotas/:id/estado', requireAdmin, async (req, res) => {
  const parsed = adminEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const id = String(req.params.id);
  try {
    const mascota = await prisma.mascota.update({
      where: { id },
      data: { estado: parsed.data.estado },
    });
    res.json({ id: mascota.id, estado: mascota.estado });
  } catch {
    res.status(404).json({ error: 'Mascota no encontrada' });
  }
});

adminRouter.patch('/mascotas/:id/validacion', requireAdmin, async (req, res) => {
  const parsed = adminValidacionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const id = String(req.params.id);
  try {
    const mascota = await prisma.mascota.update({
      where: { id },
      data: { validacion: parsed.data.validacion },
    });
    res.json({ id: mascota.id, validacion: mascota.validacion });
  } catch {
    res.status(404).json({ error: 'Mascota no encontrada' });
  }
});
