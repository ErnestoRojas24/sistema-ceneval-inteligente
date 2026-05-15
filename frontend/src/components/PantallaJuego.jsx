import { useEffect, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import HUD from './HUD'
import TimerBar from './TimerBar'
import BarraProgreso from './BarraProgreso'
import TarjetaContexto from './TarjetaContexto'
import TarjetaPregunta from './TarjetaPregunta'
import FeedbackOverlay from './FeedbackOverlay'
import Spinner from './Spinner'

export default function PantallaJuego() {
  const {
    pregunta, opciones, progreso, loading, error,
    feedback, cargarPregunta, responder,
    limpiarFeedback, timeoutOcurrio, MAX_PREGUNTAS,
  } = useGame()

  useEffect(() => {
    if (!pregunta && !loading && !feedback) {
      cargarPregunta()
    }
  }, [pregunta, loading, feedback, cargarPregunta])

  const handleResponder = useCallback((idOpcion) => {
    responder(idOpcion)
  }, [responder])

  const handleSiguiente = useCallback(() => {
    limpiarFeedback()
    cargarPregunta()
  }, [limpiarFeedback, cargarPregunta])

  if (loading && !pregunta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner texto="Cargando pregunta..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-5 animate-fade-in">
        <HUD />

        <BarraProgreso progreso={progreso} max={MAX_PREGUNTAS} />

        <TimerBar />

        {error && (
          <div className="alert alert-error text-sm">
            {error}
            <button onClick={cargarPregunta} className="btn btn-ghost btn-sm">
              Reintentar
            </button>
          </div>
        )}

        {pregunta && (
          <div className="space-y-4">
            <TarjetaContexto contexto={pregunta.contexto} />
            <TarjetaPregunta
              pregunta={pregunta}
              opciones={opciones}
              onResponder={handleResponder}
              deshabilitado={!!feedback}
            />
          </div>
        )}
      </div>

      {feedback && (
        <FeedbackOverlay
          feedback={feedback}
          esTimeout={timeoutOcurrio}
          onSiguiente={handleSiguiente}
        />
      )}
    </div>
  )
}
