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
  ChevronDown,
  Home,
  Clock,
  Shield,
  Search,
  Menu
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

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
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
    <header className="bg-bg-light shadow-sm border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-bg-light/95">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Lado izquierdo - Menu toggle + Título y breadcrumbs */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle */}
            {onToggleSidebar && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleSidebar}
                className="lg:hidden hover:bg-bg text-text-muted hover:text-primary"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-medium text-primary">
                  {currentPage}
                </h1>
                {location.pathname !== '/admin' && (
                  <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              
              {/* Breadcrumbs */}
              {breadcrumbs.length > 1 && (
                <nav className="flex items-center space-x-1 text-xs text-text-muted mt-1">
                  <Link to="/admin" className="hover:text-primary transition-colors">
                    <Home className="w-3 h-3" />
                  </Link>
                  {breadcrumbs.map((crumb, _index) => (
                    <div key={crumb.path} className="flex items-center">
                      <span className="mx-1 text-border">/</span>
                      {crumb.isLast ? (
                        <span className="font-medium text-text">{crumb.label}</span>
                      ) : (
                        <Link 
                          to={crumb.path} 
                          className="hover:text-primary transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {/* Centro - Barra de búsqueda (solo en desktop) */}
          <div className="hidden xl:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar en el panel..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Lado derecho - Información del usuario y controles */}
          <div className="flex items-center space-x-3">
            {/* Fecha y hora */}
            <div className="hidden lg:flex flex-col items-end text-sm">
              <div className="text-text font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1 text-primary" />
                {formatTime(currentTime)}
              </div>
              <div className="text-text-muted text-xs">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Separador */}
            <div className="h-6 w-px bg-border"></div>

            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-bg">
                  <div className="w-8 h-8 bg-gradient-primary text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-text">
                      Administrador
                    </span>
                    <span className="text-xs text-text-muted">
                      {user?.email?.split('@')[0] || 'admin'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-bg-light border-border">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-text">Administrador</p>
                    <p className="text-xs text-text-muted">
                      {user?.email || 'admin@toeic.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
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