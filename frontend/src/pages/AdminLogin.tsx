import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';
import { guardarTokenAdmin } from '../adminAuth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { token } = await adminLogin(password.trim());
      guardarTokenAdmin(token);
      navigate('/admin/dashboard');
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center p-4">
      <p className="u-eyebrow">Acceso restringido</p>
      <h1 className="u-title-page mt-1">Panel administrativo</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 border border-line bg-paper-raised p-6 shadow-[3px_3px_0_rgba(34,29,26,0.05)]"
      >
        <label htmlFor="admin-password" className="u-label block">
          Contraseña
        </label>
        <div className="relative mt-1">
          <input
            id="admin-password"
            type={mostrarContrasena ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="current-password"
            spellCheck={false}
            className="w-full border border-line-strong bg-paper-raised px-3 py-2 pr-16 u-body text-ink focus:border-brand-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrarContrasena((v) => !v)}
            className="u-data absolute top-1/2 right-2 -translate-y-1/2 px-1.5 py-1 text-[11px] text-ink-soft hover:text-brand-700"
          >
            {mostrarContrasena ? 'Ocultar' : 'Ver'}
          </button>
        </div>
        {error && <p className="mt-2 text-[13px] font-medium text-brand-700">{error}</p>}

        <button
          type="submit"
          disabled={enviando || !password}
          className="mt-5 w-full border-2 border-brand-700 bg-brand-600 px-4 py-2.5 font-display font-bold tracking-wide text-white uppercase shadow-[3px_3px_0_rgba(74,14,23,0.3)] transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {enviando ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
