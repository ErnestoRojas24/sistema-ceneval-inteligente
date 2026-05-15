import { useGame } from '../context/GameContext'
import ThemeToggle from './ThemeToggle'

export default function PantallaResultados() {
  const { puntaje, vidas, racha, progreso, MAX_VIDAS, reiniciar, finalizado } = useGame()

  const aciertos = progreso
  const totalPreguntas = 30
  const esAprobado = vidas > 0 && finalizado
  const pctAciertos = Math.round((aciertos / totalPreguntas) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {esAprobado ? 'Examen completado' : 'Examen finalizado'}
          </h1>
          <ThemeToggle />
        </div>

        <div className={`border-2 rounded-xl p-6 space-y-2 ${
          esAprobado ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
        }`}>
          <p className="text-3xl font-black tabular-nums">{puntaje}</p>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
            Puntaje total
          </p>
          <p className="text-sm opacity-70">
            {esAprobado
              ? 'Has completado todas las preguntas del examen.'
              : 'Se han agotado los intentos disponibles.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-base-300 rounded-xl p-4 space-y-1">
            <p className="text-2xl font-bold tabular-nums">{aciertos}/{totalPreguntas}</p>
            <p className="text-xs opacity-50 uppercase tracking-wider">Aciertos</p>
            <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${pctAciertos}%` }}
              />
            </div>
          </div>
          <div className="border border-base-300 rounded-xl p-4 space-y-1">
            <p className="text-2xl font-bold tabular-nums">{vidas}/{MAX_VIDAS}</p>
            <p className="text-xs opacity-50 uppercase tracking-wider">Intentos restantes</p>
            <div className="flex gap-1">
              {Array.from({ length: MAX_VIDAS }, (_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < vidas ? 'bg-error' : 'bg-base-300'}`}
                />
              ))}
            </div>
          </div>
          <div className="border border-base-300 rounded-xl p-4 space-y-1">
            <p className="text-2xl font-bold tabular-nums">3</p>
            <p className="text-xs opacity-50 uppercase tracking-wider">Nivel alcanzado</p>
          </div>
          <div className="border border-base-300 rounded-xl p-4 space-y-1">
            <p className="text-2xl font-bold tabular-nums text-warning">+{racha}</p>
            <p className="text-xs opacity-50 uppercase tracking-wider">Mejor racha</p>
          </div>
        </div>

        <button
          onClick={reiniciar}
          className="btn btn-primary btn-block"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
