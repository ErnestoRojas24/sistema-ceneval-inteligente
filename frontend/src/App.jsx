import { GameProvider, useGame } from './context/GameContext'
import PantallaInicio from './components/PantallaInicio'
import PantallaJuego from './components/PantallaJuego'
import PantallaResultados from './components/PantallaResultados'

function Router() {
  const { pantalla } = useGame()

  switch (pantalla) {
    case 'inicio':
      return <PantallaInicio />
    case 'juego':
      return <PantallaJuego />
    case 'resultados':
      return <PantallaResultados />
    default:
      return <PantallaInicio />
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  )
}
