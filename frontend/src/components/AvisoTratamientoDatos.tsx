import { useState } from 'react';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AvisoTratamientoDatos({ checked, onChange }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="border-l-4 border-brand-600 bg-brand-50 p-4">
      <p className="font-mono text-[10px] tracking-widest text-brand-700 uppercase">
        Ley 1581 de 2012 · Habeas Data
      </p>
      <label className="mt-1.5 flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
          required
        />
        <span>
          Autorizo el tratamiento de mis datos personales y los de contacto, para publicar esta
          información y facilitar el contacto en caso de que se encuentre la mascota.{' '}
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Leer aviso completo
          </button>
        </span>
      </label>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="max-h-[80vh] max-w-lg overflow-y-auto rounded-lg border-t-4 border-brand-600 bg-paper-raised p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display mb-3 text-lg font-extrabold text-brand-800">
              Aviso de tratamiento de datos personales
            </h2>
            <p className="mb-3 text-sm text-ink-soft">
              De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de
              Colombia, los datos personales suministrados en este formulario (nombre de contacto,
              números telefónicos y dirección de residencia) serán utilizados exclusivamente para
              publicar el reporte de mascota perdida en esta plataforma y facilitar el contacto
              entre las personas que puedan haber encontrado a la mascota y su propietario.
            </p>
            <p className="mb-4 text-sm text-ink-soft">
              Estos datos se mostrarán públicamente en la página junto con la información de la
              mascota. Al marcar la casilla de autorización, usted declara haber leído este aviso
              y otorga su consentimiento libre, expreso e informado para el tratamiento de sus
              datos con la finalidad descrita.
            </p>
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
