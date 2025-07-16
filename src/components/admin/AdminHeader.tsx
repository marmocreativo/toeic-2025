// src/components/admin/AdminHeader.tsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  ChevronDown,
  Home,
  Clock,
  Shield
} from 'lucide-react';

// Interfaces de tipos
interface Breadcrumb {
  path: string;
  label: string;
  isLast: boolean;
}

// Breadcrumb mapping para rutas
const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/sliders': 'Sliders',
  '/admin/examenes': 'Exámenes',
  '/admin/paginas': 'Páginas',
  '/admin/newsletters': 'Newsletters',
  '/admin/centros': 'Centros',
  '/admin/centros-estados': 'Estados',
};

export default function AdminHeader() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Generar breadcrumbs
  const generateBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment;
      
      breadcrumbs.push({
        path: currentPath,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPage = routeLabels[location.pathname] || 'Página';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Lado izquierdo - Título y breadcrumbs */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">
                {currentPage}
              </h1>
              {location.pathname !== '/admin' && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            
            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <nav className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <Link to="/admin" className="hover:text-blue-600 transition-colors">
                  <Home className="w-3 h-3" />
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    <span className="mx-1">/</span>
                    {crumb.isLast ? (
                      <span className="font-medium text-gray-900">{crumb.label}</span>
                    ) : (
                      <Link 
                        to={crumb.path} 
                        className="hover:text-blue-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Lado derecho - Información del usuario y controles */}
          <div className="flex items-center space-x-4">
            {/* Fecha y hora */}
            <div className="hidden md:flex flex-col items-end text-sm">
              <div className="text-gray-900 font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(currentTime)}
              </div>
              <div className="text-gray-500 text-xs">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Notificaciones */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Separador */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      Administrador
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.email?.split('@')[0] || 'admin'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Administrador</p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'admin@toeic.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}