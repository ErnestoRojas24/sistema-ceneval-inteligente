import { SessionProvider, useSession } from './context/SessionContext'
import Welcome from './components/Welcome'
import Quiz from './components/Quiz'
import Results from './components/Results'

function Router() {
  const { pantalla } = useSession()

  switch (pantalla) {
    case 'welcome':
      return <Welcome />
    case 'quiz':
      return <Quiz />
    case 'results':
      return <Results />
    default:
      return <Welcome />
  }
}

export default function App() {
  return (
    <SessionProvider>
      <Router />
    </SessionProvider>
  )
}
