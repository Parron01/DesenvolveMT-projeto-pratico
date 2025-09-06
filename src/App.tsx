import { PeopleProvider } from './hooks/usePessoas'
import { AppRoutes } from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  // Wrap routes with provider so hooks can access mock data
  return (
    <PeopleProvider>
      <AppRoutes />
      <ToastContainer />
    </PeopleProvider>
  )
}


