// src/router/index.tsx - Versión actualizada con usuarios

import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Páginas públicas
import Home from '../pages/public/Home';
import Examenes from '../pages/public/Examenes';
import ExamenDetalle from '../pages/public/ExamenDetalle';
import Centros from '../pages/public/Centros';
import FechasAplicacion from '../pages/public/FechasAplicacion';
import PaginaDetalle from '../pages/public/PaginaDetalle';
import Newsletters from '../pages/public/Newsletters';
import NewsletterDetalle from '../pages/public/NewsletterDetalle';
import Paginas from '../pages/public/Paginas';
import Contacto from '../pages/public/Contacto';
import AcercaDe from '../pages/public/AcercaDe';
import PreparationMaterial from '../pages/public/PreparationMaterial';
import ComentariosExaminado from '../pages/public/ComentariosExaminado';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Confirm from '../pages/auth/Confirm';
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
import AdminUsuarios from '../pages/admin/Usuarios'; 
import UsuarioForm from '../pages/admin/UsuarioForm';
import AdminAnuncios from '../pages/admin/Anuncios';
import AnuncioForm from '../pages/admin/AnuncioForm';
import AdminFechasAplicaciones from '../pages/admin/AdminFechasAplicaciones';
import AdminComentariosExaminado from '../pages/admin/AdminComentariosExaminado';


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
        path: 'material_preparacion',
        element: <PreparationMaterial />,
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
        path: 'fechas-aplicacion',
        element: <FechasAplicacion />,
      },
      {
        path: 'contacto',
        element: <Contacto />,
      },
      {
        path: 'acerca-de',
        element: <AcercaDe />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/auth/confirm',
        element: <Confirm  />,
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
        path: 'preparation_material',
        element: <PreparationMaterial />,
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
        path: 'application-dates',
        element: <FechasAplicacion />,
      },
      {
        path: 'contact',
        element: <Contacto />,
      },
      {
        path: 'about',
        element: <AcercaDe />,
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

    // Formulario público de comentarios del examinado (link/QR, sin header/footer)
  {
    path: '/comentarios-examinado',
    element: <ComentariosExaminado />,
  },
  {
    path: '/en/candidate-comment-form',
    element: <ComentariosExaminado />,
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
        path: 'fechas-aplicaciones',
        element: <AdminFechasAplicaciones />,
      },
      {
        path: 'comentarios-examinado',
        element: <AdminComentariosExaminado />,
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
      {
        path: 'anuncios',
        element: <AdminAnuncios />,
      },
      {
        path: 'anuncios/nuevo',
        element: <AnuncioForm />,
      },
      {
        path: 'anuncios/:id/editar',
        element: <AnuncioForm />,
      },
      {
        path: 'usuarios',
        element: <AdminUsuarios />,
      },
      {
        path: 'usuarios/nuevo',
        element: <UsuarioForm />,
      },
      {
        path: 'usuarios/:id/editar',
        element: <UsuarioForm />,
      },
    ],
  },
  
  // Ruta 404
  {
    path: '*',
    element: <NotFound />,
  },
]);