import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { iniciarExamen, obtenerPregunta, validarRespuesta } from '../services/api'

const GameContext = createContext()

const TIEMPO_POR_PREGUNTA = 30
const MAX_PREGUNTAS = 30
const MAX_VIDAS = 3

const initialState = {
  idSesion: null,
  finalizado: false,
  pregunta: null,
  opciones: [],
  progreso: 0,
  vidas: MAX_VIDAS,
  puntaje: 0,
  racha: 0,
  loading: false,
  error: null,
  feedback: null,
  pantalla: 'inicio',
  tema: localStorage.getItem('ceneval-tema') || 'night',
  tiempoRestante: TIEMPO_POR_PREGUNTA,
  timerActivo: false,
  timeoutOcurrio: false,
  nivelDificultad: 1,
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TEMA':
      return { ...state, tema: state.tema === 'night' ? 'winter' : 'night' }
    case 'SET_PANTALLA':
      return { ...state, pantalla: action.payload }
    case 'INICIAR_CARGA':
      return { ...state, loading: true, error: null, feedback: null }
    case 'INICIAR_EXITO':
      return { ...state, idSesion: action.payload.idSesion, loading: false, pantalla: 'juego' }
    case 'PREGUNTA_EXITO':
      return {
        ...state,
        pregunta: action.payload,
        opciones: action.payload.opciones || [],
        progreso: action.payload.progreso || state.progreso,
        loading: false,
        feedback: null,
        timeoutOcurrio: false,
        nivelDificultad: action.payload.nivel_dificultad || 1,
      }
    case 'PREGUNTA_FINALIZADO':
      return { ...state, finalizado: true, loading: false, pantalla: 'resultados', timerActivo: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, timerActivo: false }
    case 'RESPUESTA_EXITO': {
      const feedback = {
        esCorrecta: action.payload.es_correcta,
        retroalimentacion: action.payload.retroalimentacion || '',
        instruccion: action.payload.instruccion_agente || '',
      }
      if (action.payload.es_correcta) {
        const puntos = (50 + 10 * state.racha) * (state.nivelDificultad || 1)
        return {
          ...state, feedback,
          puntaje: state.puntaje + puntos,
          racha: state.racha + 1,
          loading: false, timerActivo: false,
        }
      }
      return {
        ...state, feedback,
        vidas: state.vidas - 1,
        racha: 0,
        loading: false, timerActivo: false,
      }
    }
    case 'TIMEOUT':
      return {
        ...state,
        timeoutOcurrio: true,
        feedback: {
          esCorrecta: false,
          retroalimentacion: 'Tiempo agotado para esta pregunta.',
          instruccion: 'Continúa con la siguiente pregunta.',
        },
        vidas: state.vidas - 1,
        racha: 0,
        timerActivo: false,
        loading: false,
      }
    case 'LIMPIAR_FEEDBACK':
      return { ...state, feedback: null, timeoutOcurrio: false }
    case 'SET_TIMER':
      return {
        ...state,
        tiempoRestante: typeof action.payload === 'function'
          ? action.payload(state.tiempoRestante)
          : action.payload,
      }
    case 'TIMER_ACTIVO':
      return { ...state, timerActivo: action.payload }
    case 'REINICIAR':
      return { ...initialState, tema: state.tema, pantalla: 'inicio' }
    case 'VIDAS_CERO':
      return { ...state, finalizado: true, pantalla: 'resultados', timerActivo: false }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem('ceneval-tema', state.tema)
    document.documentElement.setAttribute('data-theme', state.tema)
  }, [state.tema])

  useEffect(() => {
    if (state.vidas <= 0 && state.pantalla === 'juego') {
      dispatch({ type: 'VIDAS_CERO' })
    }
  }, [state.vidas, state.pantalla])

  const toggleTema = useCallback(() => dispatch({ type: 'TOGGLE_TEMA' }), [])

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
      if (data.finalizado) {
        dispatch({ type: 'PREGUNTA_FINALIZADO' })
      } else {
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
      dispatch({ type: 'RESPUESTA_EXITO', payload: data })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [state.idSesion, state.pregunta])

  const timeout = useCallback(() => dispatch({ type: 'TIMEOUT' }), [])
  const limpiarFeedback = useCallback(() => dispatch({ type: 'LIMPIAR_FEEDBACK' }), [])
  const setTimer = useCallback((t) => dispatch({ type: 'SET_TIMER', payload: t }), [])
  const setTimerActivo = useCallback((a) => dispatch({ type: 'TIMER_ACTIVO', payload: a }), [])
  const reiniciar = useCallback(() => dispatch({ type: 'REINICIAR' }), [])

  const value = {
    ...state, toggleTema, iniciar, cargarPregunta, responder,
    timeout, limpiarFeedback, setTimer, setTimerActivo, reiniciar,
    MAX_PREGUNTAS, MAX_VIDAS, TIEMPO_POR_PREGUNTA,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider')
  return ctx
}
