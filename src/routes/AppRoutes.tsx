import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy loading para otimizar o carregamento das páginas
const HomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })))
const PessoaDetalhePage = lazy(() => import('../pages/PessoaDetalhePage').then(module => ({ default: module.default })))

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/pessoas/:id', element: <PessoaDetalhePage /> },
])

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Carregando...</div></div>}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Suspense>
  )
}
