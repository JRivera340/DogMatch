import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectorUbicacion } from './SelectorUbicacion';
import { AvisoTratamientoDatos } from './AvisoTratamientoDatos';
import { crearMascota, guardarEditToken, presignUpload, subirFotoAS3 } from '../api';
import type { Edad, Especie, Tamano, TipoReporte } from '../types';
import { SENAS_DISPONIBLES } from '../data/senas';
import { CameraIcon } from './icons';

const TELEFONO_REGEX = /^(\+?57)?[3][0-9]{9}$/;

const inputClass =
  'mt-1 w-full border border-line-strong bg-paper-raised px-3 py-2 u-body text-ink placeholder:text-ink-faint focus:border-brand-600 focus:outline-none';
const labelClass = 'u-label block';
const errorClass = 'mt-1 text-[13px] font-medium text-brand-700';

function Seccion({ numero, titulo, children }: { numero: string; titulo: string; children: ReactNode }) {
  return (
    <section className="border border-line bg-paper-raised p-5 shadow-[3px_3px_0_rgba(34,29,26,0.05)] sm:p-6">
      <div className="mb-5 flex items-baseline gap-3 border-b-2 border-line pb-3">
        <span className="u-data text-brand-600">{numero}</span>
        <h2 className="u-title-card">{titulo}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

interface Errores {
  [campo: string]: string;
}

export function FormReportar() {
  const navigate = useNavigate();

  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('perdida');
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState<Especie>('Perro');
  const [raza, setRaza] = useState('');
  const [genero, setGenero] = useState<'Macho' | 'Hembra'>('Macho');
  const [color, setColor] = useState('');
  const [tamano, setTamano] = useState<Tamano>('Mediano');
  const [edad, setEdad] = useState<Edad>('Adulto');
  const [senasParticulares, setSenasParticulares] = useState('');
  const [senas, setSenas] = useState<string[]>([]);
  const [otrasSenas, setOtrasSenas] = useState('');
  const [esUrgente, setEsUrgente] = useState(false);
  const [esAsustadiza, setEsAsustadiza] = useState(false);
  const [ultimaVezFecha, setUltimaVezFecha] = useState('');
  const [ultimaVezLugarTexto, setUltimaVezLugarTexto] = useState('');
  const [lugarResidencia, setLugarResidencia] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [autoriza, setAutoriza] = useState(false);

  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const etiquetaColor = especie === 'Perro' ? 'Color del perro' : 'Color del gato';
  const esRescatada = tipoReporte === 'rescatada';

  useEffect(() => {
    if (!foto) {
      setPreviewFoto(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setPreviewFoto(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  function alternarSena(sena: string) {
    setSenas((prev) => (prev.includes(sena) ? prev.filter((s) => s !== sena) : [...prev, sena]));
  }

  function validar(): Errores {
    const nuevos: Errores = {};
    if (!nombre.trim()) nuevos.nombre = 'Nombre requerido';
    if (!raza.trim()) nuevos.raza = 'Raza requerida';
    if (!color.trim()) nuevos.color = 'Color requerido';
    if (!ultimaVezFecha) nuevos.ultimaVezFecha = 'Fecha y hora requeridas';
    else if (new Date(ultimaVezFecha).getTime() > Date.now())
      nuevos.ultimaVezFecha = 'La fecha no puede ser futura';
    if (!ultimaVezLugarTexto.trim()) nuevos.ultimaVezLugarTexto = 'Lugar requerido';
    if (!lugarResidencia.trim()) nuevos.lugarResidencia = 'Lugar de residencia requerido';
    if (!TELEFONO_REGEX.test(telefono1.trim()))
      nuevos.telefono1 = 'Teléfono inválido (formato colombiano, ej. 3001234567)';
    if (telefono2.trim() && !TELEFONO_REGEX.test(telefono2.trim()))
      nuevos.telefono2 = 'Teléfono inválido (formato colombiano, ej. 3001234567)';
    if (telefono2.trim() && telefono1.trim() === telefono2.trim())
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
        tipoReporte,
        especie,
        raza: raza.trim(),
        genero,
        color: color.trim(),
        tamano,
        edad,
        senasParticulares: senasParticulares.trim(),
        senas,
        otrasSenas: otrasSenas.trim(),
        esUrgente,
        esAsustadiza,
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
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'No se pudo publicar el reporte. Intenta de nuevo.';
      setErrorEnvio(mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="u-eyebrow">Formulario de reporte</p>
        <h1 className="u-title-page mt-1">
          {esRescatada ? 'Reportar mascota rescatada' : 'Reportar mascota perdida'}
        </h1>
      </div>

      <section className="border border-line bg-paper-raised p-5 shadow-[3px_3px_0_rgba(34,29,26,0.05)] sm:p-6">
        <label className={labelClass}>¿Eres el dueño de esta mascota?</label>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTipoReporte('perdida');
              if (nombre === 'N/A') setNombre('');
            }}
            aria-pressed={!esRescatada}
            className={`u-body flex-1 border px-4 py-2.5 font-semibold transition-colors ${
              !esRescatada
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line-strong text-ink-soft hover:border-brand-600 hover:text-brand-700'
            }`}
          >
            Sí, es mi mascota
          </button>
          <button
            type="button"
            onClick={() => {
              setTipoReporte('rescatada');
              if (!nombre.trim()) setNombre('N/A');
            }}
            aria-pressed={esRescatada}
            className={`u-body flex-1 border px-4 py-2.5 font-semibold transition-colors ${
              esRescatada
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line-strong text-ink-soft hover:border-brand-600 hover:text-brand-700'
            }`}
          >
            No, la encontré sin dueño
          </button>
        </div>
        <p className="u-data mt-2 text-ink-faint">
          {esRescatada
            ? 'Publicamos esta mascota como rescatada, sin dueño conocido, para que su dueño la reconozca o alguien la adopte.'
            : 'Publicamos tu mascota como perdida para que la reconozcan y te contacten.'}
        </p>
      </section>

      <Seccion numero="01" titulo="Datos de la mascota">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Especie</label>
            <select
              value={especie}
              onChange={(e) => setEspecie(e.target.value as Especie)}
              className={inputClass}
            >
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Nombre de la mascota</label>
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

          <div>
            <label className={labelClass}>{etiquetaColor}</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={especie === 'Perro' ? 'Café, negro, blanco...' : 'Gris, atigrado, blanco...'}
              className={inputClass}
            />
            {errores.color && <p className={errorClass}>{errores.color}</p>}
          </div>

          <div>
            <label className={labelClass}>Tamaño</label>
            <select
              value={tamano}
              onChange={(e) => setTamano(e.target.value as Tamano)}
              className={inputClass}
            >
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Edad aproximada</label>
            <select
              value={edad}
              onChange={(e) => setEdad(e.target.value as Edad)}
              className={inputClass}
            >
              <option value="Cachorro">Cachorro</option>
              <option value="Joven">Joven</option>
              <option value="Adulto">Adulto</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Foto de la mascota</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="mt-1 w-full u-body text-ink-soft file:mr-3 file:border file:border-brand-600 file:bg-brand-100 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
            />
            {errores.foto && <p className={errorClass}>{errores.foto}</p>}
            <div className="mt-3 flex items-center gap-3 border border-line-strong bg-paper p-2">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Vista previa de la foto seleccionada"
                  className="h-20 w-20 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-paper-raised text-line-strong">
                  <CameraIcon className="h-8 w-8" />
                </div>
              )}
              <p className="u-data text-ink-faint">
                {previewFoto ? 'Vista previa' : 'Aún no has seleccionado una foto'}
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion numero="02" titulo="Señas particulares">
        <div>
          <label className={labelClass}>Señas particulares</label>
          <p className="u-data mt-0.5 text-ink-faint">
            Lo que la distingue de otra igual de la misma raza y color.
          </p>
          <textarea
            value={senasParticulares}
            onChange={(e) => setSenasParticulares(e.target.value)}
            rows={2}
            placeholder="Ej. tiene una mancha blanca en forma de estrella en el pecho"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Marca lo que aplique</label>
          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {SENAS_DISPONIBLES.map((sena) => (
              <label key={sena} className="flex items-center gap-2 u-body text-ink">
                <input
                  type="checkbox"
                  checked={senas.includes(sena)}
                  onChange={() => alternarSena(sena)}
                  className="h-4 w-4 shrink-0 accent-brand-600"
                />
                {sena}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Otras señas (opcional)</label>
          <input
            value={otrasSenas}
            onChange={(e) => setOtrasSenas(e.target.value)}
            placeholder="Cualquier otra característica que ayude a identificarla"
            className={inputClass}
          />
        </div>

        <label className="flex items-start gap-3 border-l-4 border-brand-600 bg-brand-50 p-3 u-body">
          <input
            type="checkbox"
            checked={esUrgente}
            onChange={(e) => setEsUrgente(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
          />
          <span>
            Requiere tratamiento médico o padece alguna enfermedad.{' '}
            <span className="font-semibold text-brand-700">Por eso este caso es prioritario.</span>
          </span>
        </label>

        <label className="flex items-start gap-3 border-l-4 border-brand-600 bg-brand-50 p-3 u-body">
          <input
            type="checkbox"
            checked={esAsustadiza}
            onChange={(e) => setEsAsustadiza(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
          />
          <span>
            Puede ponerse nerviosa o desconfiar de personas extrañas. Le pedimos a quien la
            encuentre acercarse con calma.
          </span>
        </label>
      </Seccion>

      <Seccion numero="03" titulo={esRescatada ? 'Cuándo y dónde la encontraste' : 'Última vez vista'}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{esRescatada ? 'Fecha y hora en que la encontraste' : 'Fecha y hora'}</label>
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
          <label className={labelClass}>
            {esRescatada
              ? 'Ciudad y punto exacto donde la encontraste'
              : 'Ciudad y punto exacto (busca la ciudad, luego haz click en el mapa)'}
          </label>
          <div className="mt-1 border border-line-strong">
            <SelectorUbicacion
              lat={lat}
              lng={lng}
              onSeleccionar={(a, b) => {
                setLat(a);
                setLng(b);
              }}
              error={errores.ubicacion}
            />
          </div>
        </div>
      </Seccion>

      <Seccion numero="04" titulo="Contacto y residencia">
        <div>
          <label className={labelClass}>
            {esRescatada
              ? 'Dónde está la mascota ahora (para saber a dónde ir a recogerla)'
              : 'Lugar de residencia (para saber a dónde ir)'}
          </label>
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
            <label className={labelClass}>
              Teléfono de contacto 2{' '}
              <span className="text-ink-faint normal-case">(opcional)</span>
            </label>
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

      {errorEnvio && <p className="text-[13px] font-medium text-brand-700">{errorEnvio}</p>}

      <div className="border-l-4 border-moss-600 bg-moss-100 p-3">
        <p className="u-body text-moss-700">
          Este servicio es gratuito. Publicar tu reporte y contactar por WhatsApp no tiene costo.
        </p>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full border-2 border-brand-700 bg-brand-600 px-4 py-3 font-display font-bold tracking-wide text-white uppercase shadow-[3px_3px_0_rgba(74,14,23,0.3)] transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {enviando ? 'Publicando...' : 'Publicar reporte'}
      </button>
    </form>
  );
}
