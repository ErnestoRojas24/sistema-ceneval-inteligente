const BASE_URL = 'https://sistema-ceneval-inteligente.onrender.com'

export async function iniciarExamen() {
  const res = await fetch(`${BASE_URL}/iniciar`)
  if (!res.ok) throw new Error('Error al iniciar el examen')
  return res.json()
}

export async function obtenerPregunta(idSesion) {
  let res
  try {
    res = await fetch(`${BASE_URL}/pregunta/${idSesion}`)
  } catch {
    throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.')
  }
  if (!res.ok) throw new Error('Error al obtener la pregunta')
  try {
    return await res.json()
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida.')
  }
}

export async function validarRespuesta(idSesion, idPregunta, idOpcion, puntajeActual = 0) {
  let res
  try {
    res = await fetch(`${BASE_URL}/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_sesion: idSesion, id_pregunta: idPregunta, id_opcion: idOpcion, puntaje_actual: puntajeActual }),
    })
  } catch {
    throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.')
  }
  if (!res.ok) throw new Error('Error al validar la respuesta')
  try {
    return await res.json()
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida.')
  }
}

export async function obtenerResultados(idSesion) {
  let res
  try {
    res = await fetch(`${BASE_URL}/resultados/${idSesion}`)
  } catch {
    throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.')
  }
  if (!res.ok) throw new Error('Error al obtener resultados')
  try {
    return await res.json()
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida.')
  }
}
