// src/pages/admin/Sliders.tsx - Con Drag & Drop
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sliderService } from '../../services/sliderService';
import type { Slider } from '../../types/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Image as ImageIcon,
  Grid,
  List,
  GripVertical,
  ArrowUpDown,
  Save
} from 'lucide-react';

// Drag & Drop imports (necesitarás instalar @dnd-kit)
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

export default function AdminSliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      setLoading(true);
      const data = await sliderService.getSliders();
      setSliders(data);
    } catch (err: any) {
      console.error('Error loading sliders:', err);
      setError('Error al cargar los sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id: number, currentStatus: boolean) => {
    try {
      await sliderService.togglePublished(id, !currentStatus);
      setSliders(sliders.map(slider => 
        slider.id === id 
          ? { ...slider, publicado: !currentStatus }
          : slider
      ));
    } catch (err: any) {
      console.error('Error toggling published status:', err);
      setError('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este slider?')) {
      return;
    }

    try {
      setDeletingId(id);
      await sliderService.deleteSlider(id);
      setSliders(sliders.filter(slider => slider.id !== id));
    } catch (err: any) {
      console.error('Error deleting slider:', err);
      setError('Error al eliminar el slider');
    } finally {
      setDeletingId(null);
    }
  };

  // Manejar el final del drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setSliders((items) => {
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
      const orderedIds = sliders.map(slider => slider.id);
      const result = await sliderService.reorderSliders(orderedIds);
      
      if (result.success) {
        setHasUnsavedChanges(false);
        setError(null);
        // Recargar para obtener el orden actualizado desde la base de datos
        await loadSliders();
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
    loadSliders(); // Recargar orden original
  };

  // Activar modo reordenamiento y cambiar a vista lista
  const handleStartReorder = () => {
    setViewMode('list'); // Forzar vista de lista
    setReorderMode(true);
  };

  // Componente para elementos arrastrables
  const SortableSliderCard = ({ slider }: { slider: Slider }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: slider.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={`overflow-hidden ${isDragging ? 'shadow-lg' : ''} ${reorderMode ? 'cursor-grab' : ''}`}
        {...(!reorderMode ? {} : attributes)}
      >
        <CardContent className="p-0">
          {/* Handle para drag & drop */}
          {reorderMode && (
            <div 
              className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
            </div>
          )}

          {/* Imagen del slider */}
          <div className="relative h-48 bg-gray-100">
            {slider.imagen ? (
              <img
                src={slider.imagen}
                alt={slider.titulo || 'Slider'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '';
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Sin imagen</span>
              </div>
            )}
            
            {/* Badge de estado */}
            <div className="absolute top-2 right-2">
              <Badge variant={slider.publicado ? 'default' : 'secondary'}>
                {slider.publicado ? 'Publicado' : 'Borrador'}
              </Badge>
            </div>

            {/* Badge de orden */}
            {reorderMode && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="bg-white/90">
                  #{slider.orden || 0}
                </Badge>
              </div>
            )}

            {/* Logo si existe */}
            {slider.logo && (
              <div className="absolute bottom-2 left-2">
                <img
                  src={slider.logo}
                  alt="Logo"
                  className="h-8 w-auto bg-white p-1 rounded shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold truncate">
                {slider.titulo || 'Sin título'}
              </h3>
              
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {slider.subtitulo || 'Sin subtítulo'}
              </p>
              
              {slider.boton_texto && (
                <p className="text-xs text-gray-500 mt-2">
                  Botón: {slider.boton_texto}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Creado: {new Date(slider.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Acciones */}
            {!reorderMode && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublished(slider.id, slider.publicado)}
                  title={slider.publicado ? 'Despublicar' : 'Publicar'}
                >
                  {slider.publicado ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                
                <Button variant="outline" size="sm" asChild title="Editar">
                  <Link to={`/admin/sliders/${slider.id}/editar`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(slider.id)}
                  disabled={deletingId === slider.id}
                  title="Eliminar"
                >
                  {deletingId === slider.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const SortableSliderListItem = ({ slider }: { slider: Slider }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: slider.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card 
        ref={setNodeRef} 
        style={style}
        className={`${isDragging ? 'shadow-lg' : ''} ${reorderMode ? 'cursor-grab' : ''}`}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
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

            {/* Imagen thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden relative">
                {slider.imagen ? (
                  <img
                    src={slider.imagen}
                    alt={slider.titulo || 'Slider'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Badge de orden en modo reordenamiento */}
                {reorderMode && (
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="outline" className="text-xs bg-white">
                      #{slider.orden || 0}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">
                  {slider.titulo || 'Sin título'}
                </h3>
                <Badge variant={slider.publicado ? 'default' : 'secondary'}>
                  {slider.publicado ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-2">
                {slider.subtitulo || 'Sin subtítulo'}
              </p>
              
              {slider.boton_texto && (
                <p className="text-sm text-gray-500">
                  Botón: {slider.boton_texto}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Creado: {new Date(slider.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Acciones */}
            {!reorderMode && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublished(slider.id, slider.publicado)}
                >
                  {slider.publicado ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/sliders/${slider.id}/editar`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(slider.id)}
                  disabled={deletingId === slider.id}
                >
                  {deletingId === slider.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Sliders</h1>
        
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
              {sliders.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleStartReorder}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Reordenar
                </Button>
              )}
              
              <Button asChild>
                <Link to="/admin/sliders/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Slider
                </Link>
              </Button>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Orden
              </Button>
            </div>
          )}
        </div>
      </div>

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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sliders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay sliders
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primer slider.
              </p>
              <Button asChild>
                <Link to="/admin/sliders/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Slider
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sliders.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sliders.map((slider) => (
                  <SortableSliderCard key={slider.id} slider={slider} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {sliders.map((slider) => (
                  <SortableSliderListItem key={slider.id} slider={slider} />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}