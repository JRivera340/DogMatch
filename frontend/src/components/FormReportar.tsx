import { type FormEvent, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectorUbicacion } from './SelectorUbicacion';
import { AvisoTratamientoDatos } from './AvisoTratamientoDatos';
import { crearMascota, guardarEditToken, presignUpload, subirFotoAS3 } from '../api';

const TELEFONO_REGEX = /^(\+?57)?[3][0-9]{9}$/;

const inputClass =
  'mt-1 w-full rounded-md border border-line-strong bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-600 focus:outline-none';
const labelClass = 'block text-xs font-semibold tracking-wide text-ink-soft uppercase';
const errorClass = 'mt-1 text-xs font-medium text-brand-700';

function Seccion({ numero, titulo, children }: { numero: string; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-paper-raised p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-line pb-2.5">
        <span className="font-mono text-xs text-brand-600">{numero}</span>
        <h2 className="font-display text-sm font-bold tracking-wide text-ink uppercase">
          {titulo}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <div>
        <p className="font-mono text-xs tracking-widest text-brand-600 uppercase">
          Formulario de reporte
        </p>
        <h1 className="font-display text-2xl font-extrabold text-ink">Reportar mascota perdida</h1>
      </div>

      <Seccion numero="01" titulo="Datos de la mascota">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre del perro</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
            />
            {errores.nombre && <p className={errorClass}>{errores.nombre}</p>}
          </div>

          <div>
            <label className={labelClass}>Raza</label>
            <input value={raza} onChange={(e) => setRaza(e.target.value)} className={inputClass} />
            {errores.raza && <p className={errorClass}>{errores.raza}</p>}
          </div>

          <div>
            <label className={labelClass}>Género</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value as 'Macho' | 'Hembra')}
              className={inputClass}
            >
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Foto de la mascota</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
            />
            {errores.foto && <p className={errorClass}>{errores.foto}</p>}
          </div>
        </div>
      </Seccion>

      <Seccion numero="02" titulo="Última vez vista">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Fecha y hora</label>
            <input
              type="datetime-local"
              value={ultimaVezFecha}
              onChange={(e) => setUltimaVezFecha(e.target.value)}
              className={inputClass}
            />
            {errores.ultimaVezFecha && <p className={errorClass}>{errores.ultimaVezFecha}</p>}
          </div>

          <div>
            <label className={labelClass}>Lugar (descripción)</label>
            <input
              value={ultimaVezLugarTexto}
              onChange={(e) => setUltimaVezLugarTexto(e.target.value)}
              placeholder="Parque principal, cerca a la iglesia"
              className={inputClass}
            />
            {errores.ultimaVezLugarTexto && (
              <p className={errorClass}>{errores.ultimaVezLugarTexto}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Punto exacto en el mapa (click para marcar)</label>
          <div className="mt-1 overflow-hidden rounded-md border border-line-strong">
            <SelectorUbicacion
              lat={lat}
              lng={lng}
              onSeleccionar={(a, b) => {
                setLat(a);
                setLng(b);
              }}
            />
          </div>
          {errores.ubicacion && <p className={errorClass}>{errores.ubicacion}</p>}
        </div>
      </Seccion>

      <Seccion numero="03" titulo="Contacto y residencia">
        <div>
          <label className={labelClass}>Lugar de residencia (para saber a dónde ir)</label>
          <input
            value={lugarResidencia}
            onChange={(e) => setLugarResidencia(e.target.value)}
            placeholder="Cra 10 #5-20, barrio Centro, Armenia"
            className={inputClass}
          />
          {errores.lugarResidencia && <p className={errorClass}>{errores.lugarResidencia}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Teléfono de contacto 1</label>
            <input
              value={telefono1}
              onChange={(e) => setTelefono1(e.target.value)}
              placeholder="3001234567"
              className={`${inputClass} font-mono`}
            />
            {errores.telefono1 && <p className={errorClass}>{errores.telefono1}</p>}
          </div>

          <div>
            <label className={labelClass}>Teléfono de contacto 2</label>
            <input
              value={telefono2}
              onChange={(e) => setTelefono2(e.target.value)}
              placeholder="3007654321"
              className={`${inputClass} font-mono`}
            />
            {errores.telefono2 && <p className={errorClass}>{errores.telefono2}</p>}
          </div>
        </div>
      </Seccion>

      <AvisoTratamientoDatos checked={autoriza} onChange={setAutoriza} />
      {errores.autoriza && <p className={errorClass}>{errores.autoriza}</p>}

      {errorEnvio && <p className="text-sm font-medium text-brand-700">{errorEnvio}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-brand-600 px-4 py-3 font-display font-bold tracking-wide text-white uppercase shadow-sm shadow-brand-900/20 transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {enviando ? 'Publicando...' : 'Publicar reporte'}
      </button>
    </form>
  );
}
