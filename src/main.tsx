import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index'
import './index.css'

import './styles/tailwind.css'      // Configuración principal de Tailwind 4
import './styles/components.css'    // Componentes CSS personalizados

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)