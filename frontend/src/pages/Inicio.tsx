import { useEffect, useState } from 'react';
import { MapaMascotas } from '../components/MapaMascotas';
import { MascotaCard } from '../components/MascotaCard';
import { listarMascotas } from '../api';
import type { Mascota } from '../types';

export function Inicio() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarMascotas()
      .then(setMascotas)
      .catch(() => setError('No se pudieron cargar las mascotas.'))
      .finally(() => setCargando(false));
  }, []);

  function handleEncontrada(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex w-full flex-col md:flex-row">
      <div className="relative h-72 shrink-0 border-b-2 border-brand-700 md:h-full md:w-3/5 md:border-r-2 md:border-b-0">
        <MapaMascotas mascotas={mascotas} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto bg-paper">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b-2 border-line bg-paper-raised px-4 py-3">
          <div>
            <p className="u-eyebrow text-ink-faint">Casos activos</p>
            <p className="u-title-section text-brand-700">{cargando ? '—' : mascotas.length}</p>
          </div>
          <span className="u-data border border-brand-600 bg-brand-50 px-3 py-1 text-brand-700">
            En tiempo real
          </span>
        </div>

        <div className="flex-1 space-y-4 p-4">
          {cargando && <p className="u-body text-ink-soft">Cargando reportes...</p>}
          {error && <p className="u-body text-brand-700">{error}</p>}
          {mascotas.map((mascota) => (
            <MascotaCard key={mascota.id} mascota={mascota} onEncontrada={handleEncontrada} />
          ))}
          {!cargando && mascotas.length === 0 && !error && (
            <div className="border border-dashed border-line-strong p-6 text-center">
              <p className="u-body text-ink-soft">
                Aún no hay mascotas reportadas. Sé el primero en publicar un caso.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
