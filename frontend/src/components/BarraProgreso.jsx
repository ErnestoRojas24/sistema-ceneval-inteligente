export default function BarraProgreso({ progreso, max }) {
  const pct = Math.min((progreso / max) * 100, 100)

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium opacity-60">Progreso</span>
        <span className="text-xs font-mono font-bold tabular-nums">
          {progreso}/{max}
        </span>
      </div>
      <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
