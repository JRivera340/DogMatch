import { Link, Outlet, useLocation } from 'react-router-dom';
import { PawIcon } from './icons';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      <header className="border-b-4 border-double border-brand-700 bg-paper-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-brand-700 text-brand-700"
              aria-hidden
            >
              <PawIcon className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-extrabold tracking-tight text-ink sm:text-[1.15rem]">
                Huellas de <span className="text-brand-600">Regreso</span>
              </span>
              <span className="u-eyebrow mt-0.5 text-[9px] text-ink-faint">
                Registro de mascotas perdidas · Colombia
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/"
              className={`border-b-2 px-1 py-1 text-sm font-semibold transition-colors sm:px-2 ${
                location.pathname === '/'
                  ? 'border-brand-600 text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              Mapa
            </Link>
            <Link
              to="/reportar"
              className="border-2 border-brand-600 bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-[2px_2px_0_rgba(74,14,23,0.3)] transition-colors hover:bg-brand-700 sm:px-4"
            >
              Reportar mascota
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-paper-raised py-3">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:justify-between">
          <span className="u-eyebrow">
            Huellas de Regreso · Red de apoyo para reunir mascotas con sus familias
          </span>
          <div className="flex items-center gap-1.5 text-ink-faint">
            <span className="u-data text-[10px]">Desarrollado por</span>
            <img src="/brand/demodata-logo.png" alt="DemoData" className="h-4 w-auto" />
          </div>
        </div>
      </footer>
    </div>
  );
}
