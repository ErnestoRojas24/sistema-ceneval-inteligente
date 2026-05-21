import { motion } from 'framer-motion'
import { useSession } from '../context/SessionContext'

function obtenerCalificacion(puntaje) {
  const nota = Math.min(10, Math.floor(puntaje / 300))
  let color = 'badge-error'
  if (nota >= 8) color = 'badge-success'
  else if (nota >= 6) color = 'badge-info'
  else if (nota >= 4) color = 'badge-warning'
  return { texto: nota, color }
}

export default function Results() {
  const { resultados, puntaje, rachaMaxima, reiniciar, toggleTema, tema } = useSession()

  if (!resultados) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const { preguntas_respondidas, nivel_numero, nivel_texto, diagnostico_agente, es_victoria, titulo_pantalla, puntaje: puntajeResultado } = resultados
  const esVictoria = es_victoria === true
  const puntajeFinal = puntajeResultado ?? puntaje

  return (
    <div className="min-h-screen bg-base-200/50">
      <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-4 sm:px-6">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-base-content">Resultados Finales</span>
        </div>
        <div className="flex-none">
          <button className="btn btn-ghost btn-sm btn-square" onClick={toggleTema} title="Cambiar tema">
            {tema === 'night' ? (
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            {esVictoria ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-success/10 text-success mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Evaluación Superada</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-error/10 text-error mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                <span>Evaluación Finalizada</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-base-content mt-2">
              {titulo_pantalla}
            </h1>
            <p className="text-base-content/60 mt-1">
              {esVictoria
                ? 'Respondiste todas las preguntas. Aquí están tus resultados.'
                : 'Agotaste todas tus vidas. Revisa tu diagnóstico para mejorar.'}
            </p>
          </div>
        </motion.div>

        {}
        {true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className={`card shadow-xl border w-full max-w-xs ${
              esVictoria ? 'bg-success/5 border-success/30' : 'bg-base-100 border-base-300'
            }`}>
              <div className="card-body items-center text-center py-6">
                <p className="text-xs uppercase tracking-widest text-base-content/50">Puntaje Final</p>
                <p className={`text-5xl font-black ${esVictoria ? 'text-success' : 'text-primary'}`}>
                  {puntajeFinal}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-base-content/60">
                  <span>Racha máxima: {rachaMaxima}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex justify-center"
          >
            <div className="card shadow-xl border w-full max-w-xs bg-base-100 border-base-300">
              <div className="card-body items-center text-center py-6">
                <p className="text-xs uppercase tracking-widest text-base-content/50">Calificación Final</p>
                <p className={`text-5xl font-black ${obtenerCalificacion(puntajeFinal).color === 'badge-success' ? 'text-success' : obtenerCalificacion(puntajeFinal).color === 'badge-info' ? 'text-info' : obtenerCalificacion(puntajeFinal).color === 'badge-warning' ? 'text-warning' : 'text-error'}`}>
                  {obtenerCalificacion(puntajeFinal).texto}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-base-content/60">
                  <span>de 10 · {puntajeFinal} pts obtenidos</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="stats stats-vertical sm:stats-horizontal shadow-lg bg-base-100 w-full"
        >
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <div className="stat-title">Preguntas Respondidas</div>
            <div className="stat-value text-primary">{preguntas_respondidas}</div>
            <div className="stat-desc">De 30 preguntas totales</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
            <div className="stat-title">Nivel Máximo Alcanzado</div>
            <div className="stat-value text-secondary">{nivel_numero}</div>
            <div className="stat-desc">{nivel_texto}</div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card bg-base-100 border border-base-300 shadow-lg"
        >
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              <h3 className="card-title text-lg">Diagnóstico del Agente</h3>
            </div>
            <p className="text-base text-base-content/80 leading-relaxed">
              {diagnostico_agente}
            </p>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <button className="btn btn-primary btn-lg shadow-lg min-w-[200px]" onClick={reiniciar}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Realizar Nueva Evaluación
          </button>
        </motion.div>
      </div>
    </div>
  )
}
