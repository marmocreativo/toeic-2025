// src/router/index.tsx - Versión actualizada con contacto

import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Páginas públicas
import Home from '../pages/public/Home';
import Examenes from '../pages/public/Examenes';
import ExamenDetalle from '../pages/public/ExamenDetalle';
import Centros from '../pages/public/Centros';
import PaginaDetalle from '../pages/public/PaginaDetalle';
import Newsletters from '../pages/public/Newsletters';
import NewsletterDetalle from '../pages/public/NewsletterDetalle';
import Paginas from '../pages/public/Paginas';
import Contacto from '../pages/public/Contacto'; // ✅ Nueva importación
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import NotFound from '../pages/NotFound';

// Páginas de administrador
import AdminDashboard from '../pages/admin/Dashboard';
import AdminSliders from '../pages/admin/Sliders';
import SliderForm from '../pages/admin/SliderForm';
import AdminExamenes from '../pages/admin/Examenes';
import ExamenForm from '../pages/admin/ExamenForm';
import AdminCentros from '../pages/admin/Centros';
import AdminCentrosEstados from '../pages/admin/CentrosEstados';
import AdminNewsletters from '../pages/admin/AdminNewsletters';
import AdminPaginas from '../pages/admin/Paginas';
import PaginaForm from '../pages/admin/PaginaForm';

export const router = createBrowserRouter([
  // Rutas públicas en español (por defecto)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'examenes',
        element: <Examenes />,
      },
      {
        path: 'examen/:url',
        element: <ExamenDetalle />,
      },
      {
        path: 'paginas',
        element: <Paginas />,
      },
      {
        path: 'pagina/:url',
        element: <PaginaDetalle />,
      },
      {
        path: 'newsletters',
        element: <Newsletters />,
      },
      {
        path: 'newsletter/:id',
        element: <NewsletterDetalle />,
      },
      {
        path: 'centros-autorizados',
        element: <Centros />,
      },
      {
        path: 'contacto', // ✅ Nueva ruta en español
        element: <Contacto />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
  
  // Rutas públicas en inglés (prefijo /en)
  {
    path: '/en',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'tests',
        element: <Examenes />,
      },
      {
        path: 'test/:url',
        element: <ExamenDetalle />,
      },
      {
        path: 'pages',
        element: <Paginas />,
      },
      {
        path: 'page/:url',
        element: <PaginaDetalle />,
      },
      {
        path: 'newsletters',
        element: <Newsletters />,
      },
      {
        path: 'newsletter/:id',
        element: <NewsletterDetalle />,
      },
      {
        path: 'authorized-centers',
        element: <Centros />,
      },
      {
        path: 'contact', // ✅ Nueva ruta en inglés
        element: <Contacto />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
  
  // Redirects para mantener compatibilidad
  {
    path: '/centros',
    element: <Navigate to="/centros-autorizados" replace />,
  },
  {
    path: '/centros/:estado',
    element: <Navigate to="/centros-autorizados" replace />,
  },
  
  // Rutas de administrador (protegidas) - Solo en español
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'sliders',
        element: <AdminSliders />,
      },
      {
        path: 'sliders/nuevo',
        element: <SliderForm />,
      },
      {
        path: 'sliders/:id/editar',
        element: <SliderForm />,
      },
      {
        path: 'examenes',
        element: <AdminExamenes />,
      },
      {
        path: 'examenes/nuevo',
        element: <ExamenForm />,
      },
      {
        path: 'examenes/:id/editar',
        element: <ExamenForm />,
      },
      {
        path: 'centros',
        element: <AdminCentros />,
      },
      {
        path: 'centros-estados',
        element: <AdminCentrosEstados />,
      },
      {
        path: 'newsletters',
        element: <AdminNewsletters />,
      },
      {
        path: 'paginas',
        element: <AdminPaginas />,
      },
      {
        path: 'paginas/nueva',
        element: <PaginaForm />,
      },
      {
        path: 'paginas/:id/editar',
        element: <PaginaForm />,
      },
    ],
  },
  
  // Ruta 404
  {
    path: '*',
    element: <NotFound />,
  },
]);