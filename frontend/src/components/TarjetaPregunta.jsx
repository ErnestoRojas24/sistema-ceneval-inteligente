import { useState, useEffect } from 'react'
import Opciones from './Opciones'

export default function TarjetaPregunta({ pregunta, opciones, onResponder, deshabilitado }) {
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    setSeleccionado(null)
  }, [pregunta?.id_pregunta])

  const handleEnviar = () => {
    if (seleccionado !== null && !deshabilitado) {
      onResponder(seleccionado)
    }
  }

  if (!pregunta) return null

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Pregunta
        </p>
        <h2 className="text-lg font-semibold leading-relaxed">
          {pregunta.pregunta_texto}
        </h2>
      </div>

      <div className="border-t border-base-300 pt-4">
        <Opciones
          opciones={opciones}
          onSeleccionar={setSeleccionado}
          deshabilitado={deshabilitado}
          seleccionado={seleccionado}
        />
      </div>

      <button
        onClick={handleEnviar}
        disabled={seleccionado === null || deshabilitado}
        className="btn btn-primary btn-block"
      >
        {deshabilitado ? 'Respondido' : 'Responder'}
      </button>
    </div>
  )
}
