// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Páginas públicas
import Home from '../pages/public/Home';
import Examenes from '../pages/public/Examenes';
import ExamenDetalle from '../pages/public/ExamenDetalle';
import Centros from '../pages/public/Centros';
import Paginas from '../pages/public/Paginas';
import PaginaDetalle from '../pages/public/PaginaDetalle';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import NotFound from '../pages/NotFound';

// Páginas de administrador
import AdminDashboard from '../pages/admin/Dashboard';
import AdminSliders from '../pages/admin/Sliders';
import AdminExamenes from '../pages/admin/Examenes';
import AdminExamenForm from '../pages/admin/ExamenForm';
import AdminCentros from '../pages/admin/Centros';
import AdminCentrosEstados from '../pages/admin/CentrosEstados';
import AdminPaginas from '../pages/admin/Paginas';
import AdminPaginaForm from '../pages/admin/PaginaForm';

export const router = createBrowserRouter([
  // Rutas públicas
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
        path: 'examenes/:url',
        element: <ExamenDetalle />,
      },
      {
        path: 'centros',
        element: <Centros />,
      },
      {
        path: 'centros/:estado',
        element: <Centros />,
      },
      {
        path: 'paginas/:url',
        element: <PaginaDetalle />,
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
  
  // Rutas de administrador (protegidas)
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
        path: 'examenes',
        element: <AdminExamenes />,
      },
      {
        path: 'examenes/nuevo',
        element: <AdminExamenForm />,
      },
      {
        path: 'examenes/:id/editar',
        element: <AdminExamenForm />,
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
        path: 'paginas',
        element: <AdminPaginas />,
      },
      {
        path: 'paginas/nueva',
        element: <AdminPaginaForm />,
      },
      {
        path: 'paginas/:id/editar',
        element: <AdminPaginaForm />,
      },
    ],
  },
  
  // Ruta 404
  {
    path: '*',
    element: <NotFound />,
  },
]);