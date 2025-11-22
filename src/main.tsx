import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index'
import './index.css'

import './styles/tailwind.css'      // Configuración principal de Tailwind 4
import './styles/components.css'    // Componentes CSS personalizados



import { loadGoogleAnalytics } from './lib/analytics'


// ✅ VALIDACIÓN CORREGIDA
if (import.meta.env.VITE_GA_MEASUREMENT_ID && import.meta.env.VITE_GA_MEASUREMENT_ID.startsWith('G-')) {

  loadGoogleAnalytics()
} else {
  console.log('❌ GA no se carga - falta ID válido')
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)