// src/pages/admin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MapPin,
  FileText,
  Image,
  Globe,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
  HelpCircle,
  List,
  Building,
  Download
} from 'lucide-react';
import { getDashboardStats, getQuickActions } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';

const iconMap = {
  BookOpen,
  MapPin,
  FileText,
  Image,
  Building,
  Download
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions = getQuickActions();

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Error al cargar las estadísticas del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-text-muted">Cargando dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-medium text-primary">Dashboard de Administración</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error || 'No se pudieron cargar las estadísticas'}</span>
          </div>
        </div>
      </div>
    );
  }

  const getCompletionPercentage = (publicados: number, total: number) => {
    return total > 0 ? Math.round((publicados / total) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-primary">Dashboard de Administración</h1>
        <div className="flex items-center px-3 py-1 bg-accent/10 text-accent-dark rounded-lg border border-accent/20">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Actualizado ahora</span>
        </div>
      </div>

      {/* Acciones Rápidas - Compactas en la parte superior */}
      <div className="bg-bg-light rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap];
            const colorClasses = {
              blue: 'bg-primary hover:bg-primary-dark text-white',
              green: 'bg-secondary hover:bg-secondary-dark text-white',
              purple: 'bg-primary hover:bg-primary-dark text-white',
              orange: 'bg-accent hover:bg-accent-dark text-black',
              red: 'bg-secondary hover:bg-secondary-dark text-white'
            };
            
            return (
              <Link key={index} to={action.href}>
                <div className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md ${colorClasses[action.color as keyof typeof colorClasses] || colorClasses.blue}`}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <IconComponent className="w-6 h-6" />
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Exámenes</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mb-2">{stats.examenes.total}</div>
          <div className="text-xs text-text-muted mb-3">
            {stats.examenes.publicados} publicados, {stats.examenes.borradores} borradores
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(stats.examenes.publicados, stats.examenes.total)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Centros</h3>
            <div className="p-2 bg-secondary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary mb-2">{stats.centros.total}</div>
          <div className="text-xs text-text-muted mb-3">
            {stats.centros.publicados} publicados, {stats.centros.borradores} borradores
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(stats.centros.publicados, stats.centros.total)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Páginas</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mb-2">{stats.paginas.total}</div>
          <div className="text-xs text-text-muted mb-3">
            {stats.paginas.publicadas} publicadas, {stats.paginas.borradores} borradores
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(stats.paginas.publicadas, stats.paginas.total)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Sliders</h3>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Image className="h-5 w-5 text-accent-dark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-accent-dark mb-2">{stats.sliders.total}</div>
          <div className="text-xs text-text-muted mb-3">
            {stats.sliders.publicados} publicados, {stats.sliders.borradores} borradores
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(stats.sliders.publicados, stats.sliders.total)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Newsletters</h3>
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Download className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-secondary mb-2">{stats.newsletters.total}</div>
          <div className="text-xs text-text-muted mb-3">
            {stats.newsletters.publicados} publicados, {stats.newsletters.borradores} borradores
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(stats.newsletters.publicados, stats.newsletters.total)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles de exámenes */}
        <div className="bg-bg-light rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Detalles de Exámenes
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center text-text">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                Con horarios
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                {stats.examenes.conHorarios}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center text-text">
                <HelpCircle className="w-4 h-4 mr-2 text-secondary" />
                Con FAQs
              </span>
              <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-sm font-medium">
                {stats.examenes.conFAQs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center text-text">
                <List className="w-4 h-4 mr-2 text-accent-dark" />
                Con muestras
              </span>
              <span className="px-2 py-1 bg-accent/10 text-accent-dark rounded-lg text-sm font-medium">
                {stats.examenes.conMuestras}
              </span>
            </div>
            <div className="pt-4 border-t border-border">
              <Link to="/admin/examenes">
                <button className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 flex items-center justify-center">
                  Ver todos los exámenes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Centros por estado */}
        <div className="bg-bg-light rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Centros por Estado
          </h3>
          {stats.centros.porEstado.length > 0 ? (
            <div className="space-y-3">
              {stats.centros.porEstado.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-text">{item.estado}</span>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-sm font-medium">
                    {item.cantidad}
                  </span>
                </div>
              ))}
              {stats.centros.porEstado.length > 5 && (
                <div className="text-xs text-text-muted text-center pt-2">
                  +{stats.centros.porEstado.length - 5} estados más
                </div>
              )}
              <div className="pt-4 border-t border-border">
                <Link to="/admin/centros">
                  <button className="w-full px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors duration-200 flex items-center justify-center">
                    Ver todos los centros
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-sm text-text-muted mb-4">No hay centros registrados</p>
              <Link to="/admin/centros">
                <button className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors duration-200 flex items-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer centro
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}