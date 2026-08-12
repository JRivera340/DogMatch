const ADMIN_TOKEN_KEY = 'huellas_admin_token';

export function guardarTokenAdmin(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function obtenerTokenAdmin(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function limpiarTokenAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
