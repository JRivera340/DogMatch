import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-brand-700">DogMatch</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-brand-700">
              Mapa
            </Link>
            <Link
              to="/reportar"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Reportar mascota
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-brand-200 bg-white py-4 text-center text-xs text-gray-500">
        DogMatch — ayudando a reunir mascotas con sus familias en Colombia
      </footer>
    </div>
  );
}
