// #region Imports
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
// #endregion

// #region Lazy loading para otimizar o carregamento das páginas
const HomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })))
const PessoaDetalhePage = lazy(() => import('../pages/PessoaDetalhePage').then(module => ({ default: module.default })))
// #endregion

// #region Router
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/pessoas/:id', element: <PessoaDetalhePage /> },
])
// #endregion

export function AppRoutes() {
  // #region Render (JSX)
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Carregando...</div></div>}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Suspense>
  )
  // #endregion
}
