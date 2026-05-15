import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../context/SessionContext'
import BombTimer from './BombTimer'
import FeedbackModal from './FeedbackModal'

function Spinner({ texto }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
      {texto && <p className="text-sm text-base-content/60">{texto}</p>}
    </div>
  )
}

function Corazon({ lleno }) {
  return (
    <svg className={`w-5 h-5 ${lleno ? 'text-error' : 'text-base-300'}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}

export default function Quiz() {
  const {
    pregunta, opciones, progreso, loading, error,
    feedback, cargarPregunta, responder, limpiarFeedback,
    limpiarPregunta,
    toggleTema, tema, vidas, puntaje, racha, rachaMaxima,
    tiempoRestante, timerActivo, estadoBomba,
    setTimer, derrota,
    MAX_VIDAS, TIEMPO_POR_PREGUNTA,
  } = useSession()

  const [seleccionado, setSeleccionado] = useState(null)
  const preguntaIdRef = useRef(pregunta?.id_pregunta)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!pregunta && !loading && !feedback && !fetchingRef.current) {
      fetchingRef.current = true
      cargarPregunta()
    }
  }, [pregunta, loading, feedback, cargarPregunta])

  useEffect(() => {
    if (pregunta && fetchingRef.current) {
      fetchingRef.current = false
    }
  }, [pregunta])

  useEffect(() => {
    if (pregunta?.id_pregunta !== preguntaIdRef.current) {
      setSeleccionado(null)
      preguntaIdRef.current = pregunta?.id_pregunta
    }
  }, [pregunta?.id_pregunta])

  useEffect(() => {
    if (timerActivo && !feedback && !loading && tiempoRestante > 0) {
      const interval = setInterval(() => {
        setTimer(t => Math.max(0, t - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timerActivo, feedback, loading, tiempoRestante, setTimer])

  useEffect(() => {
    if (timerActivo && !feedback && !loading && tiempoRestante <= 0) {
      responder(0)
    }
  }, [tiempoRestante, timerActivo, feedback, loading, responder])

  const handleResponder = useCallback(() => {
    if (seleccionado == null) return
    responder(seleccionado)
  }, [seleccionado, responder])

  const handleSiguiente = useCallback(() => {
    limpiarFeedback()
    limpiarPregunta()
    if (vidas <= 0) {
      derrota()
    } else {
      cargarPregunta()
    }
  }, [limpiarFeedback, limpiarPregunta, vidas, derrota, cargarPregunta])

  const deshabilitado = loading || !!feedback
  const puedeResponder = seleccionado != null && !deshabilitado

  const barraColor = racha >= 5
    ? 'bg-success'
    : racha >= 3
      ? 'bg-info'
      : racha >= 1
        ? 'bg-warning'
        : 'bg-primary'

  if (loading && !pregunta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner texto="Cargando pregunta..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col">
      {}
      <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-3 sm:px-5">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-base-content hidden sm:inline">Sistema Evaluador</span>
          <div className="flex items-center gap-1 ml-2">
            {Array.from({ length: MAX_VIDAS }).map((_, i) => (
              <Corazon key={i} lleno={i < vidas} />
            ))}
          </div>
        </div>

        <div className="flex-none flex items-center gap-2 sm:gap-4">
          <motion.div
            key={racha}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="hidden sm:flex items-center gap-1 text-xs text-base-content/60"
          >
            <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            </svg>
            <span className="font-semibold text-base-content">{racha}</span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-base-content/60 pr-1 border-r border-base-300">
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="font-bold text-base-content">{puntaje}</span>
          </div>

          <BombTimer estado={estadoBomba} tiempoRestante={tiempoRestante} />

          <button className="btn btn-ghost btn-xs sm:btn-sm btn-square" onClick={toggleTema} title="Cambiar tema">
            {tema === 'night' ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {}
      <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="flex-1 w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className={`h-2.5 rounded-full ${barraColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((progreso / 30) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-base-content/70 whitespace-nowrap">
            {Math.min(progreso + 1, 30)}/30
          </span>
        </div>

        {}
        <div className="flex sm:hidden items-center justify-between text-xs text-base-content/60 px-1">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="font-bold text-base-content">{puntaje}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            </svg>
            <span className="font-semibold text-base-content">Racha {racha}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_VIDAS }).map((_, i) => (
              <Corazon key={i} lleno={i < vidas} />
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm shadow-lg">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
            <button onClick={cargarPregunta} className="btn btn-ghost btn-sm">Reintentar</button>
          </div>
        )}

        {pregunta?.pregunta_texto ? (
          <motion.div
            key={pregunta.id_pregunta ?? 'current'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {pregunta.contexto && (
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Caso de Estudio</span>
                  </div>
                  <p className="text-sm text-base-content/80 leading-relaxed whitespace-pre-line">{pregunta.contexto}</p>
                </div>
              </div>
            )}

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4 sm:p-5">
                <h2 className="text-base font-semibold text-base-content mb-4 leading-relaxed">
                  {pregunta.pregunta_texto}
                </h2>

                <div className="space-y-2.5">
                  {Array.isArray(opciones) && opciones.map((op) => {
                    const esSeleccionada = seleccionado === op.id_opcion
                    return (
                      <button
                        key={op.id_opcion}
                        className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                          esSeleccionada
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-base-200 bg-base-100 hover:border-base-300 hover:bg-base-200/50'
                        } ${deshabilitado ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !deshabilitado && setSeleccionado(op.id_opcion)}
                        disabled={deshabilitado}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            esSeleccionada ? 'border-primary' : 'border-base-300'
                          }`}>
                            {esSeleccionada && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="text-sm text-base-content">{op.texto_opcion}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    className={`btn btn-primary min-w-[140px] ${!puedeResponder ? 'btn-disabled' : ''}`}
                    onClick={handleResponder}
                    disabled={!puedeResponder}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Validando...
                      </>
                    ) : (
                      'Responder'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {loading && pregunta && (
          <div className="flex justify-center py-3">
            <span className="loading loading-dots loading-sm text-primary" />
          </div>
        )}
      </div>

      {feedback && (
        <FeedbackModal
          key={feedback.esCorrecta ? 'correct' : feedback.esTimeout ? 'timeout' : 'incorrect'}
          feedback={feedback}
          onSiguiente={handleSiguiente}
          esUltimaVida={vidas <= 0}
        />
      )}
    </div>
  )
}
