// src/components/admin/DashboardCards.tsx
import { 
  BookOpen, 
  FileText, 
  Building, 
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

const StatCard = ({ title, value, change, changeType, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent-dark',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-orange-100 text-orange-600'
  };

  const changeColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-text-muted'
  };

  return (
    <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${changeColorClasses[changeType || 'neutral']}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Exámenes',
      value: 12,
      change: '+2 este mes',
      changeType: 'positive' as const,
      icon: BookOpen,
      color: 'primary' as const
    },
    {
      title: 'Páginas Activas',
      value: 24,
      change: '+5 este mes',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'secondary' as const
    },
    {
      title: 'Centros Autorizados',
      value: 156,
      change: '+12 este mes',
      changeType: 'positive' as const,
      icon: Building,
      color: 'accent' as const
    },
    {
      title: 'Newsletters Enviados',
      value: 89,
      change: '+8 esta semana',
      changeType: 'positive' as const,
      icon: Download,
      color: 'success' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export const QuickActions = () => {
  const actions = [
    {
      title: 'Nuevo Examen',
      description: 'Crear un nuevo examen TOEIC',
      icon: BookOpen,
      color: 'primary' as const,
      href: '/admin/examenes/new'
    },
    {
      title: 'Nueva Página',
      description: 'Agregar página informativa',
      icon: FileText,
      color: 'secondary' as const,
      href: '/admin/paginas/new'
    },
    {
      title: 'Enviar Newsletter',
      description: 'Crear y enviar newsletter',
      icon: Download,
      color: 'accent' as const,
      href: '/admin/newsletters/new'
    },
    {
      title: 'Agregar Centro',
      description: 'Registrar nuevo centro',
      icon: Building,
      color: 'success' as const,
      href: '/admin/centros/new'
    }
  ];

  const colorClasses = {
    primary: 'bg-primary hover:bg-primary-dark',
    secondary: 'bg-secondary hover:bg-secondary-dark',
    accent: 'bg-accent hover:bg-accent-dark text-black',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="bg-bg-light rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`p-4 rounded-lg text-left hover:shadow-md transition-all duration-200 ${colorClasses[action.color]} ${action.color === 'accent' ? 'text-black' : 'text-white'}`}
          >
            <action.icon className="w-6 h-6 mb-2" />
            <h4 className="font-medium text-sm">{action.title}</h4>
            <p className={`text-xs mt-1 ${action.color === 'accent' ? 'text-black/70' : 'text-white/70'}`}>
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export const RecentActivity = () => {
  const activities = [
    {
      action: 'Nuevo examen creado',
      item: 'TOEIC®Listening & Reading',
      time: 'Hace 2 horas',
      user: 'Admin',
      type: 'create'
    },
    {
      action: 'Página actualizada',
      item: 'Información General',
      time: 'Hace 4 horas',
      user: 'Admin',
      type: 'update'
    },
    {
      action: 'Centro agregado',
      item: 'Centro CDMX Norte',
      time: 'Hace 1 día',
      user: 'Admin',
      type: 'create'
    },
    {
      action: 'Newsletter enviado',
      item: 'Boletín Marzo 2024',
      time: 'Hace 2 días',
      user: 'Admin',
      type: 'send'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-600';
      case 'update':
        return 'bg-accent/20 text-accent-dark';
      case 'send':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'create':
        return BookOpen;
      case 'update':
        return FileText;
      case 'send':
        return Download;
      default:
        return Calendar;
    }
  };

  return (
    <div className="bg-bg-light rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getTypeIcon(activity.type);
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{activity.action}</p>
                <p className="text-sm text-text-muted">{activity.item}</p>
                <p className="text-xs text-text-muted mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};