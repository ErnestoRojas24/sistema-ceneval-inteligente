import { useGame } from '../context/GameContext'
import ThemeToggle from './ThemeToggle'

export default function PantallaInicio() {
  const { iniciar, loading, error } = useGame()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sistema Evaluador CENEVAL
          </h1>
          <p className="text-sm opacity-60">
            Evaluación adaptativa inteligente
          </p>
        </div>

        <div className="bg-base-200/60 rounded-xl border border-base-300 p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider opacity-50">
            Acerca del examen
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>30 preguntas adaptativas según tu desempeño</span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>3 intentos por pregunta antes de continuar</span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>30 segundos por respuesta</span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Puntaje variable según dificultad y aciertos consecutivos</span>
            </li>
          </ul>
        </div>

        <button
          onClick={iniciar}
          disabled={loading}
          className="btn btn-primary btn-block"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Iniciando...
            </>
          ) : (
            'Comenzar examen'
          )}
        </button>

        {error && (
          <div className="alert alert-error text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
