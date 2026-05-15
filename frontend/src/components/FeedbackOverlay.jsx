import { motion, AnimatePresence } from 'framer-motion'

export default function FeedbackOverlay({ feedback, onSiguiente, esTimeout }) {
  if (!feedback) return null

  const esCorrecta = feedback.esCorrecta
  const Icono = esCorrecta ? CheckIcon : esTimeout ? ClockIcon : XIcon
  const tipo = esTimeout ? 'error' : esCorrecta ? 'success' : 'error'
  const titulo = esTimeout
    ? 'Tiempo agotado'
    : esCorrecta
    ? 'Respuesta correcta'
    : 'Respuesta incorrecta'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-lg border-2 rounded-2xl p-6 space-y-5 ${
            tipo === 'success'
              ? 'bg-success/5 border-success/30'
              : 'bg-error/5 border-error/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tipo === 'success' ? 'bg-success/20' : 'bg-error/20'
            }`}>
              <Icono />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${
                tipo === 'success' ? 'text-success' : 'text-error'
              }`}>
                {titulo}
              </h3>
            </div>
          </div>

          <p className="text-sm leading-relaxed">{feedback.retroalimentacion}</p>

          {feedback.instruccion && (
            <div className="flex items-start gap-3 p-3 bg-base-300/50 rounded-xl">
              <svg className="w-5 h-5 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              <div>
                <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-1">
                  Agente Inteligente
                </p>
                <p className="text-sm leading-relaxed">{feedback.instruccion}</p>
              </div>
            </div>
          )}

          <button
            onClick={onSiguiente}
            className="btn btn-primary btn-block"
            autoFocus
          >
            Siguiente pregunta
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
