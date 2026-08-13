import type { Mascota, NuevaMascota, Paginado, TipoReporte, Validacion } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

/** Error de API que conserva el status HTTP — el mensaje del backend no siempre incluye el código. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const mensaje =
      typeof body.error === 'string' ? body.error : body.error ? JSON.stringify(body.error) : null;
    throw new ApiError(mensaje ?? `Error ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export async function listarMascotas(page = 1, pageSize = 50): Promise<Paginado<Mascota>> {
  const res = await fetch(`${API_URL}/api/mascotas?page=${page}&pageSize=${pageSize}`);
  return manejarRespuesta<Paginado<Mascota>>(res);
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

export async function registrarClick(id: string): Promise<void> {
  // Métrica de interés, no crítica — si falla no interrumpe la experiencia del usuario.
  await fetch(`${API_URL}/api/mascotas/${id}/click`, { method: 'POST' }).catch(() => {});
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

const MASCOTAS_TOKENS_KEY = 'huellas_tokens';

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

export async function adminListarMascotas(
  token: string,
  page = 1,
  pageSize = 100,
): Promise<Paginado<Mascota>> {
  const res = await fetch(`${API_URL}/api/admin/mascotas?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return manejarRespuesta<Paginado<Mascota>>(res);
}

export async function adminEliminarMascota(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/mascotas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 204) {
    await manejarRespuesta(res);
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

/** 'perdida'/'rescatada' fijan el tipo y ponen el caso activo; 'encontrada' solo marca que ya está con su familia. */
export async function adminActualizarTipo(
  id: string,
  tipo: TipoReporte | 'encontrada',
  token: string,
): Promise<{ tipoReporte: TipoReporte; estado: 'perdida' | 'encontrada' }> {
  const res = await fetch(`${API_URL}/api/admin/mascotas/${id}/tipo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tipo }),
  });
  return manejarRespuesta(res);
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
