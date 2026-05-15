import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { iniciarExamen, obtenerPregunta, validarRespuesta, obtenerResultados } from '../services/api'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SessionContext = createContext()

const MAX_VIDAS = 3
const TIEMPO_POR_PREGUNTA = 30

function calcularPuntos(racha, tiempoRestante) {
  const rachaMult = 1 + racha * 0.25
  const velocidadMult = 0.5 + 0.5 * (tiempoRestante / TIEMPO_POR_PREGUNTA)
  return Math.round(50 * rachaMult * velocidadMult)
}

const initialState = {
  idSesion: null,
  pantalla: 'welcome',
  pregunta: null,
  opciones: [],
  progreso: 0,
  loading: false,
  error: null,
  feedback: null,
  finalizado: false,
  resultados: null,
  tema: localStorage.getItem('ceneval-tema') || 'night',

  vidas: MAX_VIDAS,
  puntaje: 0,
  racha: 0,
  rachaMaxima: 0,
  modoFinal: null,

  tiempoRestante: TIEMPO_POR_PREGUNTA,
  timerActivo: false,
  estadoBomba: 'ticking',
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TEMA':
      return { ...state, tema: state.tema === 'night' ? 'winter' : 'night' }

    case 'INICIAR_CARGA':
      return { ...state, loading: true, error: null }

    case 'INICIAR_EXITO':
      return { ...state, idSesion: action.payload.idSesion, loading: false, pantalla: 'quiz' }

    case 'PREGUNTA_EXITO': {
      const p = action.payload
      return {
        ...state,
        pregunta: p,
        opciones: p.opciones || [],
        progreso: p.progreso != null ? p.progreso : state.progreso,
        loading: false,
        feedback: null,
        tiempoRestante: TIEMPO_POR_PREGUNTA,
        timerActivo: true,
        estadoBomba: 'ticking',
      }
    }

    case 'PREGUNTA_FINALIZADO':
      return { ...state, finalizado: true, loading: false, pantalla: 'results', timerActivo: false, modoFinal: 'victoria' }

    case 'DERROTA':
      return { ...state, finalizado: true, pantalla: 'results', timerActivo: false, modoFinal: 'derrota' }

    case 'FEEDBACK_EXITO': {
      const p = action.payload
      const esTimeout = p.es_timeout === true
      let nuevoProgreso = state.progreso
      if (p.progreso) {
        const match = String(p.progreso).match(/(\d+)/)
        if (match) nuevoProgreso = parseInt(match[1], 10)
      }
      if (p.es_correcta) {
        const puntos = calcularPuntos(state.racha, state.tiempoRestante)
        return {
          ...state,
          feedback: {
            esCorrecta: true,
            retroalimentacion: p.retroalimentacion || '',
            instruccion: p.instruccion_agente || '',
            puntosGanados: puntos,
            rachaActual: state.racha + 1,
          },
          puntaje: state.puntaje + puntos,
          racha: state.racha + 1,
          rachaMaxima: Math.max(state.rachaMaxima, state.racha + 1),
          progreso: nuevoProgreso,
          loading: false,
          timerActivo: false,
          estadoBomba: 'success',
        }
      }
      return {
        ...state,
        feedback: {
          esCorrecta: false,
          retroalimentacion: p.retroalimentacion || (esTimeout ? 'Se agotó el tiempo disponible para esta pregunta.' : ''),
          instruccion: p.instruccion_agente || '',
          puntosGanados: 0,
          rachaActual: 0,
          esTimeout,
        },
        vidas: state.vidas - 1,
        racha: 0,
        progreso: nuevoProgreso,
        loading: false,
        timerActivo: false,
        estadoBomba: esTimeout ? 'explosion' : 'fail',
      }
    }

    case 'LIMPIAR_FEEDBACK':
      return { ...state, feedback: null }
    case 'LIMPIAR_PREGUNTA':
      return { ...state, pregunta: null, opciones: [] }

    case 'SET_ESTADO_BOMBA':
      return { ...state, estadoBomba: action.payload }

    case 'SET_TIMER':
      return {
        ...state,
        tiempoRestante: typeof action.payload === 'function'
          ? action.payload(state.tiempoRestante)
          : action.payload,
      }

    case 'SET_TIMER_ACTIVO':
      return { ...state, timerActivo: action.payload }

    case 'RESULTADOS_EXITO':
      return { ...state, resultados: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'REINICIAR':
      return { ...initialState, tema: state.tema, pantalla: 'welcome' }

    default:
      return state
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.tema)
  }, [state.tema])

  useEffect(() => {
    if (state.pantalla === 'results' && state.idSesion && !state.resultados) {
      obtenerResultados(state.idSesion)
        .then(data => dispatch({ type: 'RESULTADOS_EXITO', payload: data }))
        .catch(e => dispatch({ type: 'SET_ERROR', payload: e.message }))
    }
  }, [state.pantalla, state.idSesion, state.resultados])

  const toggleTema = useCallback(() => {
    const next = state.tema === 'night' ? 'winter' : 'night'
    localStorage.setItem('ceneval-tema', next)
    dispatch({ type: 'TOGGLE_TEMA' })
  }, [state.tema])

  const iniciar = useCallback(async () => {
    dispatch({ type: 'INICIAR_CARGA' })
    try {
      const data = await iniciarExamen()
      dispatch({ type: 'INICIAR_EXITO', payload: { idSesion: data.id_sesion } })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [])

  const cargarPregunta = useCallback(async () => {
    if (!state.idSesion) return
    dispatch({ type: 'INICIAR_CARGA' })
    try {
      const data = await obtenerPregunta(state.idSesion)
      if (!data) {
        dispatch({ type: 'PREGUNTA_FINALIZADO' })
      } else if (data.finalizado || data.forzar_avance || (!data.id_pregunta && data.mensaje)) {
        dispatch({ type: 'PREGUNTA_FINALIZADO' })
      } else if (!data.id_pregunta) {
        dispatch({ type: 'SET_ERROR', payload: 'No hay más preguntas disponibles.' })
      } else if (!Array.isArray(data.opciones) || data.opciones.length === 0) {
        dispatch({ type: 'PREGUNTA_FINALIZADO' })
      } else {
        data.opciones = shuffleArray(data.opciones)
        dispatch({ type: 'PREGUNTA_EXITO', payload: data })
      }
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [state.idSesion])

  const responder = useCallback(async (idOpcion) => {
    if (!state.idSesion || !state.pregunta) return
    dispatch({ type: 'INICIAR_CARGA' })
    try {
      const data = await validarRespuesta(state.idSesion, state.pregunta.id_pregunta, idOpcion)
      dispatch({ type: 'FEEDBACK_EXITO', payload: data })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [state.idSesion, state.pregunta])

  const limpiarFeedback = useCallback(() => dispatch({ type: 'LIMPIAR_FEEDBACK' }), [])
  const limpiarPregunta = useCallback(() => dispatch({ type: 'LIMPIAR_PREGUNTA' }), [])
  const reiniciar = useCallback(() => dispatch({ type: 'REINICIAR' }), [])
  const setTimer = useCallback((t) => dispatch({ type: 'SET_TIMER', payload: t }), [])
  const setTimerActivo = useCallback((a) => dispatch({ type: 'SET_TIMER_ACTIVO', payload: a }), [])
  const setEstadoBomba = useCallback((e) => dispatch({ type: 'SET_ESTADO_BOMBA', payload: e }), [])
  const derrota = useCallback(() => dispatch({ type: 'DERROTA' }), [])

  const value = {
    ...state,
    toggleTema, iniciar, cargarPregunta, responder,
    limpiarFeedback, limpiarPregunta, reiniciar, setTimer, setTimerActivo,
    setEstadoBomba, derrota,
    MAX_VIDAS, TIEMPO_POR_PREGUNTA,
  }
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}
