import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'

export default function TimerBar() {
  const {
    tiempoRestante, setTimer, timerActivo, setTimerActivo,
    timeout, pregunta, feedback, TIEMPO_POR_PREGUNTA,
  } = useGame()
  const preguntaIdRef = useRef(null)
  const intervalRef = useRef(null)
  const preguntaId = pregunta?.id_pregunta

  useEffect(() => {
    if (preguntaId && preguntaId !== preguntaIdRef.current) {
      preguntaIdRef.current = preguntaId
      setTimer(TIEMPO_POR_PREGUNTA)
      setTimerActivo(true)
    }
    if (!preguntaId) setTimerActivo(false)
  }, [preguntaId, setTimer, setTimerActivo, TIEMPO_POR_PREGUNTA])

  useEffect(() => {
    if (timerActivo && !feedback) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) return 0
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerActivo, feedback, setTimer])

  useEffect(() => {
    if (timerActivo && tiempoRestante <= 0) {
      setTimerActivo(false)
      timeout()
    }
  }, [tiempoRestante, timerActivo, setTimerActivo, timeout])

  const pct = tiempoRestante > 0 ? (tiempoRestante / TIEMPO_POR_PREGUNTA) * 100 : 0
  const esCritico = !feedback && tiempoRestante <= 10 && tiempoRestante > 0
  const colorClass = feedback
    ? feedback.esCorrecta ? 'bg-success' : 'bg-neutral'
    : esCritico ? 'bg-warning' : 'bg-primary'

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium opacity-60">Tiempo restante</span>
        <span className={`text-xs font-mono font-bold tabular-nums ${
          esCritico ? 'text-warning animate-pulse-soft' : ''
        }`}>
          {feedback
            ? '--:--'
            : `${Math.floor(tiempoRestante / 60)}:${String(tiempoRestante % 60).padStart(2, '0')}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
