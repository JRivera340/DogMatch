import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

const JWT_EXPIRES_IN = '12h';

function obtenerSecreto(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) {
    throw new Error('JWT_SECRET no configurado');
  }
  return secreto;
}

export function firmarTokenAdmin(): string {
  return jwt.sign({ role: 'admin' }, obtenerSecreto(), { expiresIn: JWT_EXPIRES_IN });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de administrador requerido' });
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, obtenerSecreto());
    if (typeof payload === 'object' && payload.role === 'admin') {
      next();
      return;
    }
    res.status(401).json({ error: 'Token inválido' });
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
