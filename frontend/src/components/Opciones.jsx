export default function Opciones({ opciones, onSeleccionar, deshabilitado, seleccionado }) {
  if (!opciones || opciones.length === 0) return null

  return (
    <div className="space-y-2.5">
      {opciones.map((opcion, i) => {
        const letra = String.fromCharCode(65 + i)
        const esSeleccionada = seleccionado === opcion.id_opcion
        return (
          <button
            key={opcion.id_opcion}
            onClick={() => !deshabilitado && onSeleccionar(opcion.id_opcion)}
            disabled={deshabilitado}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              esSeleccionada && !deshabilitado
                ? 'border-primary bg-primary/5'
                : deshabilitado
                ? 'border-base-200 bg-base-200/30 cursor-default'
                : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50 cursor-pointer'
            }`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold font-mono ${
              esSeleccionada && !deshabilitado
                ? 'bg-primary text-primary-content'
                : 'bg-base-300 text-base-content/60'
            }`}>
              {letra}
            </span>
            <span className="flex-1 text-sm">{opcion.texto_opcion}</span>
            {esSeleccionada && !deshabilitado && (
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
