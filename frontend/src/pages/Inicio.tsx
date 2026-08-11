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
    <div className="flex h-[calc(100vh-57px)] flex-col md:flex-row">
      <div className="h-72 shrink-0 md:h-full md:w-3/5">
        <MapaMascotas mascotas={mascotas} />
      </div>
      <div className="flex-1 overflow-y-auto bg-brand-50 p-4">
        <h2 className="mb-3 text-lg font-bold text-brand-800">
          Mascotas reportadas ({mascotas.length})
        </h2>
        {cargando && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-3">
          {mascotas.map((mascota) => (
            <MascotaCard key={mascota.id} mascota={mascota} onEncontrada={handleEncontrada} />
          ))}
        </div>
        {!cargando && mascotas.length === 0 && !error && (
          <p className="text-sm text-gray-500">
            Aún no hay mascotas reportadas. Sé el primero en publicar un reporte.
          </p>
        )}
      </div>
    </div>
  );
}
