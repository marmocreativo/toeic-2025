// src/pages/admin/Sliders.tsx - Con vista de imágenes
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sliderService } from '../../services/sliderService';
import type { Slider } from '../../types/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  List
} from 'lucide-react';

export default function AdminSliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const SliderCard = ({ slider }: { slider: Slider }) => (
    <Card key={slider.id} className="overflow-hidden">
      <CardContent className="p-0">
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
        </div>
      </CardContent>
    </Card>
  );

  const SliderListItem = ({ slider }: { slider: Slider }) => (
    <Card key={slider.id}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Imagen thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
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
        </div>
      </CardContent>
    </Card>
  );

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
          
          <Button asChild>
            <Link to="/admin/sliders/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Slider
            </Link>
          </Button>
        </div>
      </div>

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
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sliders.map((slider) => (
                <SliderCard key={slider.id} slider={slider} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {sliders.map((slider) => (
                <SliderListItem key={slider.id} slider={slider} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}