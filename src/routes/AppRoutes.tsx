import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import PessoaDetalhePage from '../pages/PessoaDetalhePage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/pessoas/:id', element: <PessoaDetalhePage /> },
])

export function AppRoutes() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
