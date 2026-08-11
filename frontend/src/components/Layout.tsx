import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b-4 border-double border-brand-700 bg-paper-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-lg text-white"
              aria-hidden
            >
              🐾
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              Dog<span className="text-brand-600">Match</span>
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
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-colors hover:bg-brand-700 sm:px-4"
            >
              Reportar mascota
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex min-h-0 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-paper-raised py-3 text-center font-mono text-[11px] uppercase tracking-wider text-ink-faint">
        DogMatch · Red de apoyo para reunir mascotas con sus familias en Colombia
      </footer>
    </div>
  );
}
