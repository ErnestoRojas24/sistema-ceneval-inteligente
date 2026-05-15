const BASE_URL = 'http://127.0.0.1:8000'

export async function iniciarExamen() {
  const res = await fetch(`${BASE_URL}/iniciar`)
  if (!res.ok) throw new Error('Error al iniciar el examen')
  return res.json()
}

export async function obtenerPregunta(idSesion) {
  const res = await fetch(`${BASE_URL}/pregunta/${idSesion}`)
  if (!res.ok) throw new Error('Error al obtener la pregunta')
  return res.json()
}

export async function validarRespuesta(idSesion, idPregunta, idOpcion) {
  const res = await fetch(`${BASE_URL}/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_sesion: idSesion, id_pregunta: idPregunta, id_opcion: idOpcion }),
  })
  if (!res.ok) {
    if (res.status === 500) throw new Error('Error de conexión con el Agente Inteligente')
    throw new Error('Error al validar la respuesta')
  }
  return res.json()
}
