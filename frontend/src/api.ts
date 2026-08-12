import type { Mascota, NuevaMascota, Validacion } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const mensaje =
      typeof body.error === 'string' ? body.error : body.error ? JSON.stringify(body.error) : null;
    throw new Error(mensaje ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listarMascotas(): Promise<Mascota[]> {
  const res = await fetch(`${API_URL}/api/mascotas`);
  return manejarRespuesta<Mascota[]>(res);
}

export async function crearMascota(
  data: NuevaMascota,
): Promise<{ id: string; editToken: string }> {
  const res = await fetch(`${API_URL}/api/mascotas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return manejarRespuesta(res);
}

export async function marcarEncontrada(id: string, editToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/mascotas/${id}/encontrada`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editToken }),
  });
  await manejarRespuesta(res);
}

export async function presignUpload(
  filename: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const res = await fetch(`${API_URL}/api/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });
  return manejarRespuesta(res);
}

export async function subirFotoAS3(uploadUrl: string, archivo: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': archivo.type },
    body: archivo,
  });
  if (!res.ok) {
    throw new Error('No se pudo subir la foto');
  }
}

const MASCOTAS_TOKENS_KEY = 'dogmatch_tokens';

export function guardarEditToken(id: string, editToken: string) {
  const tokens = obtenerTokensGuardados();
  tokens[id] = editToken;
  localStorage.setItem(MASCOTAS_TOKENS_KEY, JSON.stringify(tokens));
}

export function obtenerTokensGuardados(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MASCOTAS_TOKENS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

// --- Administración ---

export async function adminLogin(password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return manejarRespuesta(res);
}

export async function adminListarMascotas(token: string): Promise<Mascota[]> {
  const res = await fetch(`${API_URL}/api/admin/mascotas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return manejarRespuesta<Mascota[]>(res);
}

export async function adminEliminarMascota(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/mascotas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Error ${res.status}`);
  }
}

export async function adminActualizarEstado(
  id: string,
  estado: 'perdida' | 'encontrada',
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/mascotas/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado }),
  });
  await manejarRespuesta(res);
}

export async function adminActualizarValidacion(
  id: string,
  validacion: Validacion,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/mascotas/${id}/validacion`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ validacion }),
  });
  await manejarRespuesta(res);
}
