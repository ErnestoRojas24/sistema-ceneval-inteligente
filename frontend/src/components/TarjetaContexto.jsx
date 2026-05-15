export default function TarjetaContexto({ contexto }) {
  if (!contexto) return null

  return (
    <div className="border border-base-300 rounded-xl p-4 bg-base-200/40">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
        Contexto
      </p>
      <p className="text-sm leading-relaxed opacity-80">{contexto}</p>
    </div>
  )
}
