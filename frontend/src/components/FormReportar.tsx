import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectorUbicacion } from './SelectorUbicacion';
import { AvisoTratamientoDatos } from './AvisoTratamientoDatos';
import { crearMascota, guardarEditToken, presignUpload, subirFotoAS3 } from '../api';

const TELEFONO_REGEX = /^(\+?57)?[3][0-9]{9}$/;

interface Errores {
  [campo: string]: string;
}

export function FormReportar() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [genero, setGenero] = useState<'Macho' | 'Hembra'>('Macho');
  const [ultimaVezFecha, setUltimaVezFecha] = useState('');
  const [ultimaVezLugarTexto, setUltimaVezLugarTexto] = useState('');
  const [lugarResidencia, setLugarResidencia] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [autoriza, setAutoriza] = useState(false);

  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  function validar(): Errores {
    const nuevos: Errores = {};
    if (!nombre.trim()) nuevos.nombre = 'Nombre requerido';
    if (!raza.trim()) nuevos.raza = 'Raza requerida';
    if (!ultimaVezFecha) nuevos.ultimaVezFecha = 'Fecha y hora requeridas';
    else if (new Date(ultimaVezFecha).getTime() > Date.now())
      nuevos.ultimaVezFecha = 'La fecha no puede ser futura';
    if (!ultimaVezLugarTexto.trim()) nuevos.ultimaVezLugarTexto = 'Lugar requerido';
    if (!lugarResidencia.trim()) nuevos.lugarResidencia = 'Lugar de residencia requerido';
    if (!TELEFONO_REGEX.test(telefono1.trim()))
      nuevos.telefono1 = 'Teléfono inválido (formato colombiano, ej. 3001234567)';
    if (!TELEFONO_REGEX.test(telefono2.trim()))
      nuevos.telefono2 = 'Teléfono inválido (formato colombiano, ej. 3001234567)';
    if (telefono1.trim() && telefono1.trim() === telefono2.trim())
      nuevos.telefono2 = 'Debe ser un número diferente al primero';
    if (lat === null || lng === null) nuevos.ubicacion = 'Selecciona un punto en el mapa';
    if (!foto) nuevos.foto = 'La foto es obligatoria';
    if (!autoriza) nuevos.autoriza = 'Debes autorizar el tratamiento de datos';
    return nuevos;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0 || !foto || lat === null || lng === null) return;

    setEnviando(true);
    setErrorEnvio(null);
    try {
      const { uploadUrl, publicUrl } = await presignUpload(foto.name, foto.type);
      await subirFotoAS3(uploadUrl, foto);

      const { id, editToken } = await crearMascota({
        nombre: nombre.trim(),
        raza: raza.trim(),
        genero,
        fotoUrl: publicUrl,
        ultimaVezFecha: new Date(ultimaVezFecha).toISOString(),
        ultimaVezLugarTexto: ultimaVezLugarTexto.trim(),
        lat,
        lng,
        lugarResidencia: lugarResidencia.trim(),
        telefono1: telefono1.trim(),
        telefono2: telefono2.trim(),
        autorizaTratamientoDatos: autoriza,
      });

      guardarEditToken(id, editToken);
      navigate('/');
    } catch {
      setErrorEnvio('No se pudo publicar el reporte. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold text-brand-800">Reportar mascota perdida</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del perro</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Raza</label>
          <input
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.raza && <p className="mt-1 text-xs text-red-600">{errores.raza}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Género</label>
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value as 'Macho' | 'Hembra')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          >
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Última vez visto (fecha y hora)
          </label>
          <input
            type="datetime-local"
            value={ultimaVezFecha}
            onChange={(e) => setUltimaVezFecha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.ultimaVezFecha && (
            <p className="mt-1 text-xs text-red-600">{errores.ultimaVezFecha}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Lugar donde fue visto por última vez
          </label>
          <input
            value={ultimaVezLugarTexto}
            onChange={(e) => setUltimaVezLugarTexto(e.target.value)}
            placeholder="Ej. Parque principal, cerca a la iglesia"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.ultimaVezLugarTexto && (
            <p className="mt-1 text-xs text-red-600">{errores.ultimaVezLugarTexto}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Lugar de residencia (para saber a dónde ir si se encuentra)
          </label>
          <input
            value={lugarResidencia}
            onChange={(e) => setLugarResidencia(e.target.value)}
            placeholder="Ej. Cra 10 #5-20, barrio Centro, Armenia"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.lugarResidencia && (
            <p className="mt-1 text-xs text-red-600">{errores.lugarResidencia}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono de contacto 1
          </label>
          <input
            value={telefono1}
            onChange={(e) => setTelefono1(e.target.value)}
            placeholder="3001234567"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.telefono1 && <p className="mt-1 text-xs text-red-600">{errores.telefono1}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono de contacto 2
          </label>
          <input
            value={telefono2}
            onChange={(e) => setTelefono2(e.target.value)}
            placeholder="3007654321"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          {errores.telefono2 && <p className="mt-1 text-xs text-red-600">{errores.telefono2}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ubicación donde fue vista (click en el mapa)
        </label>
        <div className="mt-1">
          <SelectorUbicacion lat={lat} lng={lng} onSeleccionar={(a, b) => { setLat(a); setLng(b); }} />
        </div>
        {errores.ubicacion && <p className="mt-1 text-xs text-red-600">{errores.ubicacion}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Foto de la mascota</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
        {errores.foto && <p className="mt-1 text-xs text-red-600">{errores.foto}</p>}
      </div>

      <AvisoTratamientoDatos checked={autoriza} onChange={setAutoriza} />
      {errores.autoriza && <p className="text-xs text-red-600">{errores.autoriza}</p>}

      {errorEnvio && <p className="text-sm text-red-600">{errorEnvio}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {enviando ? 'Publicando...' : 'Publicar reporte'}
      </button>
    </form>
  );
}
