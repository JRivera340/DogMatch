import { Link, Outlet, useLocation } from 'react-router-dom';
import { PawIcon } from './icons';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      <header className="border-b-4 border-double border-brand-700 bg-paper-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-brand-700 text-brand-700 sm:h-10 sm:w-10"
              aria-hidden
            >
              <PawIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display truncate text-sm font-extrabold tracking-tight text-ink sm:text-base md:text-[1.15rem]">
                Huellas <span className="text-brand-600">S.O.S.</span>
              </span>
              <span className="u-eyebrow mt-0.5 hidden text-[9px] text-ink-faint sm:block">
                Buscamos su huella, encontramos su hogar
              </span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-4">
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
              className="border-2 border-brand-600 bg-brand-600 px-2.5 py-2 text-sm font-semibold text-white shadow-[2px_2px_0_rgba(74,14,23,0.3)] transition-colors hover:bg-brand-700 sm:px-4"
            >
              <span className="sm:hidden">Reportar</span>
              <span className="hidden sm:inline">Reportar mascota</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-paper-raised py-1.5 sm:py-3">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="u-eyebrow text-[8px] text-brand-700 sm:text-[9px]">
            Una iniciativa de DemoData para proteger y reunir a nuestras mascotas en momentos de emergencia. 🐾
          </span>
          <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:justify-between sm:gap-2">
            <span className="u-eyebrow text-[8px] sm:text-[9px]">
              Huellas S.O.S. · Buscamos. Rescatamos. Reencontramos.
            </span>
            <div className="flex items-center gap-1.5 text-ink-faint">
              <span className="u-data text-[9px] sm:text-[10px]">Desarrollado por</span>
              <img src="/brand/demodata-logo.png" alt="DemoData" className="h-3 w-auto sm:h-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
