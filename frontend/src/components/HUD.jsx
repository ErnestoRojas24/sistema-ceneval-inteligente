import { useGame } from '../context/GameContext'
import ThemeToggle from './ThemeToggle'

export default function HUD() {
  const { vidas, puntaje, racha, nivelDificultad, MAX_VIDAS, progreso, MAX_PREGUNTAS } = useGame()

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-base-200/60 backdrop-blur-sm rounded-xl border border-base-300">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: MAX_VIDAS }, (_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < vidas ? 'bg-error' : 'bg-base-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium opacity-50 uppercase tracking-wider">
          Intento {MAX_VIDAS - vidas + 1}/3
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium opacity-50">
          Dificultad: <span className="font-bold">{nivelDificultad}</span>
        </span>
        {racha > 0 && (
          <span className="text-xs font-medium text-warning">
            +{racha} seguidas
          </span>
        )}
        <span className="text-sm font-bold font-mono tabular-nums">
          {puntaje} pts
        </span>
        <ThemeToggle />
      </div>
    </div>
  )
}
