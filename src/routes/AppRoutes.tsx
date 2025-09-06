import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
])

export function AppRoutes() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
