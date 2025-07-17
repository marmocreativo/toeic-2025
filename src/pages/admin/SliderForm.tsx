// src/pages/admin/Sliders.tsx - Con vista de imágenes
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sliderService } from '../../services/sliderService';
import type { Slider } from '../../types/slider';
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
  AlertCircle
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
    <div className="bg-bg-light rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      {/* Imagen del slider */}
      <div className="relative h-48 bg-bg">
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
            <ImageIcon className="h-12 w-12 text-border" />
            <span className="ml-2 text-text-muted">Sin imagen</span>
          </div>
        )}
        
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            slider.publicado 
              ? 'bg-accent text-black' 
              : 'bg-bg-light text-text-muted border border-border'
          }`}>
            {slider.publicado ? 'Publicado' : 'Borrador'}
          </span>
        </div>

        {/* Logo si existe */}
        {slider.logo && (
          <div className="absolute bottom-3 left-3">
            <img
              src={slider.logo}
              alt="Logo"
              className="h-8 w-auto bg-bg-light p-1 rounded shadow-sm border border-border"
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
          <h3 className="text-lg font-semibold truncate text-text">
            {slider.titulo || 'Sin título'}
          </h3>
          
          <p className="text-text-muted text-sm mt-1 line-clamp-2">
            {slider.subtitulo || 'Sin subtítulo'}
          </p>
          
          {slider.boton_texto && (
            <p className="text-xs text-text-muted mt-2">
              Botón: {slider.boton_texto}
            </p>
          )}
          
          <p className="text-xs text-text-muted mt-2">
            Creado: {new Date(slider.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleTogglePublished(slider.id, slider.publicado)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              slider.publicado 
                ? 'bg-accent/10 text-accent-dark hover:bg-accent/20' 
                : 'bg-bg text-text-muted hover:bg-border'
            }`}
            title={slider.publicado ? 'Despublicar' : 'Publicar'}
          >
            {slider.publicado ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          
          <Link to={`/admin/sliders/${slider.id}/editar`}>
            <button 
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </button>
          </Link>
          
          <button
            onClick={() => handleDelete(slider.id)}
            disabled={deletingId === slider.id}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
            title="Eliminar"
          >
            {deletingId === slider.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const SliderListItem = ({ slider }: { slider: Slider }) => (
    <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <div className="flex items-start gap-4">
        {/* Imagen thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-20 h-16 bg-bg rounded overflow-hidden border border-border">
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
                <ImageIcon className="h-6 w-6 text-border" />
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-text">
              {slider.titulo || 'Sin título'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              slider.publicado 
                ? 'bg-accent text-black' 
                : 'bg-bg text-text-muted border border-border'
            }`}>
              {slider.publicado ? 'Publicado' : 'Borrador'}
            </span>
          </div>
          
          <p className="text-text-muted mb-2">
            {slider.subtitulo || 'Sin subtítulo'}
          </p>
          
          {slider.boton_texto && (
            <p className="text-sm text-text-muted">
              Botón: {slider.boton_texto}
            </p>
          )}
          
          <p className="text-xs text-text-muted mt-2">
            Creado: {new Date(slider.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => handleTogglePublished(slider.id, slider.publicado)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              slider.publicado 
                ? 'bg-accent/10 text-accent-dark hover:bg-accent/20' 
                : 'bg-bg text-text-muted hover:bg-border'
            }`}
          >
            {slider.publicado ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          
          <Link to={`/admin/sliders/${slider.id}/editar`}>
            <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200">
              <Edit className="h-4 w-4" />
            </button>
          </Link>
          
          <button
            onClick={() => handleDelete(slider.id)}
            disabled={deletingId === slider.id}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
          >
            {deletingId === slider.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-primary">Gestión de Sliders</h1>
        
        <div className="flex items-center gap-4">
          {/* Toggle de vista */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-bg-light">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'text-text-muted hover:text-primary hover:bg-bg'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'text-text-muted hover:text-primary hover:bg-bg'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <Link to="/admin/sliders/nuevo">
            <button className="btn-primary flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Slider
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {sliders.length === 0 ? (
        <div className="bg-bg-light rounded-lg border border-border p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No hay sliders
            </h3>
            <p className="text-text-muted mb-4">
              Comienza creando tu primer slider para la página principal.
            </p>
            <Link to="/admin/sliders/nuevo">
              <button className="btn-primary flex items-center mx-auto">
                <Plus className="mr-2 h-4 w-4" />
                Crear Slider
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Contador de sliders */}
          <div className="flex items-center justify-between">
            <p className="text-text-muted">
              {sliders.length} {sliders.length === 1 ? 'slider' : 'sliders'} en total
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                {sliders.filter(s => s.publicado).length} Publicados
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-border rounded-full"></div>
                {sliders.filter(s => !s.publicado).length} Borradores
              </span>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sliders.map((slider) => (
                <SliderCard key={slider.id} slider={slider} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
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