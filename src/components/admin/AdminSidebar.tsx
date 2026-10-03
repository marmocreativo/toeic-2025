// src/components/admin/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Image, 
  FileText, 
  MapPin, 
  Building, 
  BookOpen,
  Download,
  X,
  Shield,
  BarChart3,
  Users,
  Megaphone, 
  Calendar,
  MessageSquareText
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/sliders', icon: Image, label: 'Sliders' },
    { path: '/admin/examenes', icon: BookOpen, label: 'Exámenes' },
    { path: '/admin/paginas', icon: FileText, label: 'Páginas' },
    { path: '/admin/newsletters', icon: Download, label: 'Newsletters' },
    { path: '/admin/centros', icon: Building, label: 'Centros' },
    { path: '/admin/centros-estados', icon: MapPin, label: 'Estados' },
    { path: '/admin/fechas-aplicaciones', icon: Calendar, label: 'Fechas Aplicación' },
    { path: '/admin/comentarios-examinado', icon: MessageSquareText, label: 'Comentarios' },
    { path: '/admin/anuncios', icon: Megaphone, label: 'Anuncios' },
    { path: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const Icon = item.icon;
    const isActive = item.exact 
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);
    
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={`group flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mx-3 ${
          isActive
            ? 'bg-primary text-white shadow-primary'
            : 'text-text-muted hover:bg-primary hover:text-primary'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`mr-3 h-5 w-5 transition-colors ${
            isActive ? 'text-white' : 'text-text-muted group-hover:text-white'
          }`} />
          <span className={`${
            isActive ? 'text-white' : 'text-text-muted group-hover:text-white'
          }`} >{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-light border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        min-h-screen
      `}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">TOEIC®Admin</h2>
              <p className="text-xs text-text-muted">Panel de Control</p>
            </div>
          </div>
          
          {/* Botón de cierre para móviles */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-bg rounded-lg text-text-muted hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          {/* Menú principal */}
          <div className="space-y-1">
            <div className="px-3 mb-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Principal
              </h3>
            </div>
            {menuItems.map(renderMenuItem)}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-accent-dark" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text">Sistema</h4>
                <p className="text-xs text-text-muted">En línea</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}