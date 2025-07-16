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
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getDashboardStats, getQuickActions } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';

const iconMap = {
  BookOpen,
  MapPin,
  FileText,
  Image,
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
        <div className="text-lg text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'No se pudieron cargar las estadísticas'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getCompletionPercentage = (publicados: number, total: number) => {
    return total > 0 ? Math.round((publicados / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <Badge variant="outline" className="text-sm">
          <Clock className="w-4 h-4 mr-2" />
          Actualizado ahora
        </Badge>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exámenes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.examenes.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.examenes.publicados} publicados, {stats.examenes.borradores} borradores
            </div>
            <Progress 
              value={getCompletionPercentage(stats.examenes.publicados, stats.examenes.total)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.centros.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.centros.publicados} publicados, {stats.centros.borradores} borradores
            </div>
            <Progress 
              value={getCompletionPercentage(stats.centros.publicados, stats.centros.total)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.paginas.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.paginas.publicadas} publicadas, {stats.paginas.borradores} borradores
            </div>
            <Progress 
              value={getCompletionPercentage(stats.paginas.publicadas, stats.paginas.total)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sliders</CardTitle>
            <Image className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.sliders.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.sliders.publicados} publicados, {stats.sliders.borradores} borradores
            </div>
            <Progress 
              value={getCompletionPercentage(stats.sliders.publicados, stats.sliders.total)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletters</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.newsletters.total}</div>
            <div className="text-xs text-muted-foreground">
              {stats.newsletters.publicados} publicados, {stats.newsletters.borradores} borradores
            </div>
            <Progress 
              value={getCompletionPercentage(stats.newsletters.publicados, stats.newsletters.total)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles de exámenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Detalles de Exámenes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                Con horarios
              </span>
              <Badge variant="secondary">{stats.examenes.conHorarios}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-green-500" />
                Con FAQs
              </span>
              <Badge variant="secondary">{stats.examenes.conFAQs}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center">
                <List className="w-4 h-4 mr-2 text-purple-500" />
                Con muestras
              </span>
              <Badge variant="secondary">{stats.examenes.conMuestras}</Badge>
            </div>
            <div className="pt-2">
              <Link to="/admin/examenes">
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos los exámenes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Centros por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Centros por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.centros.porEstado.length > 0 ? (
              <div className="space-y-3">
                {stats.centros.porEstado.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{item.estado}</span>
                    <Badge variant="outline">{item.cantidad}</Badge>
                  </div>
                ))}
                {stats.centros.porEstado.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    +{stats.centros.porEstado.length - 5} estados más
                  </div>
                )}
                <div className="pt-2">
                  <Link to="/admin/centros">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todos los centros
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No hay centros registrados</p>
                <Link to="/admin/centros">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar primer centro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = iconMap[action.icon as keyof typeof iconMap];
              return (
                <Link key={index} to={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                          <IconComponent className={`w-5 h-5 text-${action.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Exámenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.actividad.examenesRecientes.length > 0 ? (
              <div className="space-y-2">
                {stats.actividad.examenesRecientes.map((examen) => (
                  <div key={examen.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{examen.titulo}</span>
                    <Badge variant={examen.publicado ? "default" : "secondary"} className="text-xs">
                      {examen.publicado ? 'Pub' : 'Borr'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay exámenes recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Centros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.actividad.centrosRecientes.length > 0 ? (
              <div className="space-y-2">
                {stats.actividad.centrosRecientes.map((centro) => (
                  <div key={centro.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{centro.nombre}</span>
                    <Badge variant={centro.publicado ? "default" : "secondary"} className="text-xs">
                      {centro.publicado ? 'Pub' : 'Borr'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay centros recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Páginas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.actividad.paginasRecientes.length > 0 ? (
              <div className="space-y-2">
                {stats.actividad.paginasRecientes.map((pagina) => (
                  <div key={pagina.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{pagina.titulo}</span>
                    <Badge variant={pagina.publicado ? "default" : "secondary"} className="text-xs">
                      {pagina.publicado ? 'Pub' : 'Borr'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay páginas recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Newsletters Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.actividad.newslettersRecientes.length > 0 ? (
              <div className="space-y-2">
                {stats.actividad.newslettersRecientes.map((newsletter) => (
                  <div key={newsletter.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{newsletter.titulo}</span>
                    <Badge variant={newsletter.publicado ? "default" : "secondary"} className="text-xs">
                      {newsletter.publicado ? 'Pub' : 'Borr'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay newsletters recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}