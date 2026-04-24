// pages/admin/Examenes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examenService } from '../../services/examenService';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
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
  ExternalLink,
  Grid,
  List,
  GripVertical,
  ArrowUpDown,
  Save
} from 'lucide-react';
import type { Examen, ExamenStats } from '../../types/examen';

// Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function AdminExamenes() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [stats, setStats] = useState<ExamenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reorderMode, setReorderMode] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Manejar el final del drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setExamenes((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);
      setHasUnsavedChanges(true);
      return newOrder;
    });
  };

  // Guardar el nuevo orden
  const handleSaveOrder = async () => {
    try {
      setReordering(true);
      const orderedIds = examenes.map(examen => examen.id);
      const result = await examenService.reorderExamenes(orderedIds);
      
      if (result.success) {
        setHasUnsavedChanges(false);
        setError(null);
        await loadData();
      } else {
        setError('Error al guardar el orden: ' + (result.errors?.join(', ') || 'Error desconocido'));
      }
    } catch (err: any) {
      console.error('Error saving order:', err);
      setError('Error al guardar el orden');
    } finally {
      setReordering(false);
    }
  };

  // Cancelar reordenamiento
  const handleCancelReorder = () => {
    setReorderMode(false);
    setHasUnsavedChanges(false);
    // NO forzar vista - mantener la que el usuario tenía
    loadData(); // Recargar orden original
  };

  // Activar modo reordenamiento y cambiar a vista lista
  const handleStartReorder = () => {
    setViewMode('list'); // Forzar vista de lista
    setReorderMode(true);
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

  // Componente para elemento sorteable
  const SortableExamenCard = ({ examen }: { examen: Examen }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: examen.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card 
        ref={setNodeRef} 
        style={style}
        className={`hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''} ${reorderMode ? 'cursor-grab' : ''}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Handle para drag & drop */}
            {reorderMode && (
              <div 
                className="flex-shrink-0 self-center cursor-grab active:cursor-grabbing p-1"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5 text-gray-600" />
              </div>
            )}

            {/* Imagen */}
            {examen.imagen && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={examen.imagen}
                    alt={examen.titulo || 'Examen'}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  {/* Badge de orden en modo reordenamiento */}
                  {reorderMode && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="outline" className="text-xs bg-white">
                        #{examenes.findIndex(e => e.id === examen.id) + 1}
                      </Badge>
                    </div>
                  )}
                </div>
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
              {!reorderMode && (
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
                      href={`/examen/${examen.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Ver en sitio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
            Administra los exámenes TOEIC®con horarios, FAQs, extras y muestras
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Controles de reordenamiento */}
          {!reorderMode ? (
            <>
              {/* Toggle de vista */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Botón de reordenamiento */}
              {examenes.length > 1 && !searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleStartReorder}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Reordenar
                </Button>
              )}
              
              <Link to="/admin/examenes/nuevo">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Examen
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancelReorder}
                disabled={reordering}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveOrder}
                disabled={!hasUnsavedChanges || reordering}
              >
                {reordering ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Orden
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {stats && !reorderMode && (
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
      {!reorderMode && (
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
      )}

      {/* Mensaje de modo reordenamiento */}
      {reorderMode && (
        <Alert>
          <ArrowUpDown className="h-4 w-4" />
          <AlertDescription>
            Arrastra los elementos para cambiar su orden. Los cambios se guardarán cuando hagas clic en "Guardar Orden".
            {hasUnsavedChanges && (
              <span className="font-medium text-orange-600 ml-2">
                Tienes cambios sin guardar.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

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
                  : 'Comienza creando tu primer examen TOEIC® con horarios, FAQs y material de muestra'
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
          <>
            {/* En modo reordenamiento o vista lista: usar drag & drop */}
            {(reorderMode || viewMode === 'list') ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={examenes.map(e => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {examenes.map((examen) => (
                      <SortableExamenCard key={examen.id} examen={examen} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              /* Vista Grid sin drag & drop */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examenes.map((examen) => (
                  <Card key={examen.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Imagen */}
                        {examen.imagen && (
                          <div className="w-full h-48 overflow-hidden rounded-lg">
                            <img
                              src={examen.imagen}
                              alt={examen.titulo || 'Examen'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Contenido */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {examen.titulo || 'Sin título'}
                            </h3>
                            <Badge variant={examen.publicado ? 'default' : 'secondary'}>
                              {examen.publicado ? 'Publicado' : 'Borrador'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {examen.resumen || 'Sin resumen disponible'}
                          </p>

                          <p className="text-xs text-gray-400 mb-3">
                            /{examen.url}
                          </p>

                          {/* Indicadores compactos */}
                          <div className="flex items-center gap-1 mb-3 text-xs">
                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded">H</div>
                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded">F</div>
                            <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded">E</div>
                            <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded">M</div>
                          </div>

                          {/* Acciones compactas */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Link to={`/admin/examenes/${examen.id}/editar`}>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </Link>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTogglePublished(examen.id, examen.publicado)}
                              >
                                {examen.publicado ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(examen.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            {examen.publicado && (
                              <a
                                href={`/examen/${examen.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
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