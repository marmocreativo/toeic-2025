import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Image, 
  FileText, 
  MapPin, 
  Building, 
  BookOpen,
  Download
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/sliders', icon: Image, label: 'Sliders' },
    { path: '/admin/examenes', icon: BookOpen, label: 'Exámenes' },
    { path: '/admin/paginas', icon: FileText, label: 'Páginas' },
    { path: '/admin/newsletters', icon: Download, label: 'Newsletters' },
    { path: '/admin/centros', icon: Building, label: 'Centros' },
    { path: '/admin/centros-estados', icon: MapPin, label: 'Estados' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Administración</h2>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}