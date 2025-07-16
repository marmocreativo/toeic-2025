// pages/admin/Examenes.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examenService } from '../../services/examenService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  HelpCircle,
  FileText,
  Users,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import type { Examen, ExamenStats } from '../../types/examen';

export default function AdminExamenes() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [stats, setStats] = useState<ExamenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [examenesData, statsData] = await Promise.all([
        examenService.getExamenes(),
        examenService.getStats()
      ]);
      
      setExamenes(examenesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const results = await examenService.searchExamenes(searchQuery);
      setExamenes(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id: number, publicado: boolean) => {
    try {
      await examenService.togglePublished(id, !publicado);
      
      // Actualizar estado local
      setExamenes(prev => 
        prev.map(examen => 
          examen.id === id ? { ...examen, publicado: !publicado } : examen
        )
      );
      
      // Recargar estadísticas
      const newStats = await examenService.getStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cambiando estado';
      setError(`Error cambiando estado: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen? Esta acción eliminará también todos sus horarios, FAQs, extras y muestras.')) {
      return;
    }

    try {
      await examenService.deleteExamen(id);
      
      // Actualizar estado local
      setExamenes(prev => prev.filter(examen => examen.id !== id));
      
      // Recargar estadísticas
      const newStats = await examenService.getStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando examen';
      setError(`Error eliminando examen: ${errorMessage}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && examenes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando exámenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Exámenes
          </h1>
          <p className="text-gray-600">
            Administra los exámenes TOEIC con horarios, FAQs, extras y muestras
          </p>
        </div>
        <Link to="/admin/examenes/nuevo">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Examen
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exámenes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.publicados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <EyeOff className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.borradores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalHorarios + stats.totalExtras + stats.totalFaqs + stats.totalMuestras}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar exámenes por título, resumen o contenido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  loadData();
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Exámenes */}
      <div className="space-y-4">
        {examenes.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? 'No se encontraron exámenes' : 'No hay exámenes'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda o revisa la ortografía' 
                  : 'Comienza creando tu primer examen TOEIC con horarios, FAQs y material de muestra'
                }
              </p>
              {!searchQuery && (
                <Link to="/admin/examenes/nuevo">
                  <Button className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primer Examen
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          examenes.map((examen) => (
            <Card key={examen.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Imagen */}
                  {examen.imagen && (
                    <div className="flex-shrink-0">
                      <img
                        src={examen.imagen}
                        alt={examen.titulo || 'Examen'}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {examen.titulo || 'Sin título'}
                        </h3>
                        <Badge variant={examen.publicado ? 'default' : 'secondary'}>
                          {examen.publicado ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {examen.resumen || 'Sin resumen disponible'}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Actualizado {formatDate(examen.updated_at || examen.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>/{examen.url}</span>
                      </div>
                    </div>

                    {/* Indicadores de contenido */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md text-xs">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-700 font-medium">Horarios</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md text-xs">
                        <HelpCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700 font-medium">FAQs</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-md text-xs">
                        <FileText className="h-3 w-3 text-purple-600" />
                        <span className="text-purple-700 font-medium">Extras</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md text-xs">
                        <Users className="h-3 w-3 text-orange-600" />
                        <span className="text-orange-700 font-medium">Muestras</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Link to={`/admin/examenes/${examen.id}/editar`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                        </Link>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublished(examen.id, examen.publicado)}
                          className="flex items-center gap-1"
                        >
                          {examen.publicado ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Despublicar
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Publicar
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(examen.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>

                      {examen.publicado && (
                        <a
                          href={`/examenes/${examen.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          Ver en sitio
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Loading overlay para acciones */}
      {loading && examenes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="font-medium">Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
}