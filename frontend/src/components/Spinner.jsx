export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-sm opacity-60">{texto}</p>
    </div>
  )
}
