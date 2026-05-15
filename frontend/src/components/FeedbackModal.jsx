import { motion, AnimatePresence } from 'framer-motion'

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const panel = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.15 } },
}

function IconoCorrecto() {
  return (
    <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
      <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    </div>
  )
}

function IconoIncorrecto() {
  return (
    <div className="w-14 h-14 rounded-full bg-error/15 flex items-center justify-center">
      <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </div>
  )
}

function IconoTimeout() {
  return (
    <div className="w-14 h-14 rounded-full bg-base-300 flex items-center justify-center">
      <svg className="w-7 h-7 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
  )
}

export default function FeedbackModal({ feedback, onSiguiente, esUltimaVida }) {
  const { esCorrecta, retroalimentacion, instruccion, puntosGanados, rachaActual, esTimeout } = feedback
  const gameOver = esUltimaVida && !esCorrecta

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 sm:p-8 space-y-5 ${
            esTimeout
              ? 'border-base-300'
              : esCorrecta
                ? 'border-success/30'
                : 'border-error/30'
          }`}
          style={{ backgroundColor: 'var(--color-base-100)' }}
          variants={panel}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex items-center gap-4">
            {gameOver ? (
              <div className="w-14 h-14 rounded-full bg-base-300 flex items-center justify-center">
                <svg className="w-7 h-7 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                </svg>
              </div>
            ) : esTimeout ? <IconoTimeout /> : esCorrecta ? <IconoCorrecto /> : <IconoIncorrecto />}
            <div>
              <h3 className={`text-xl font-bold ${
                gameOver ? 'text-base-content' : esTimeout ? 'text-base-content' : esCorrecta ? 'text-success' : 'text-error'
              }`}>
                {gameOver ? '¡HAS PERDIDO TODAS TUS VIDAS!'
                  : esTimeout ? '¡TIEMPO AGOTADO!'
                    : esCorrecta ? '¡RESPUESTA CORRECTA!'
                      : '¡INCORRECTO!'}
              </h3>
              <p className="text-sm text-base-content/60">
                {gameOver
                  ? 'La evaluación ha finalizado. Revisa tu diagnóstico para conocer tu nivel.'
                  : esTimeout
                    ? 'No alcanzaste a responder dentro del tiempo límite.'
                    : esCorrecta
                      ? 'Seleccionaste la opción correcta. ¡Bien hecho!'
                      : 'La opción seleccionada no es la correcta. Revisa la retroalimentación.'}
              </p>
            </div>
          </div>

          {esCorrecta && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-6 py-2"
            >
              <div className="text-center">
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Puntos</p>
                <p className="text-2xl font-bold text-success">+{puntosGanados}</p>
              </div>
              <div className="w-px h-10 bg-base-300" />
              <div className="text-center">
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Racha</p>
                <p className="text-2xl font-bold text-warning">{rachaActual}</p>
              </div>
            </motion.div>
          )}

          <div className={`rounded-xl p-4 ${
            esTimeout ? 'bg-base-200' : esCorrecta ? 'bg-success/5' : 'bg-error/5'
          }`}>
            <p className="text-sm font-medium text-base-content/70 mb-1">Retroalimentación</p>
            <p className="text-base text-base-content">{retroalimentacion}</p>
          </div>

          <div className="rounded-xl bg-base-200/50 p-4">
            <p className="text-sm font-medium text-base-content/70 mb-1">Siguiente paso</p>
            <p className="text-sm text-base-content">{instruccion}</p>
          </div>

          {gameOver && (
            <div className="alert alert-error text-sm">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>Has perdido todas tus vidas. Serás redirigido a los resultados finales.</span>
            </div>
          )}

          <button className="btn btn-primary w-full" onClick={onSiguiente}>
            {gameOver ? 'Ver Resultados Finales' : 'Siguiente Pregunta'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
