import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paginaService } from '../../services/paginaService';
import type { Pagina } from '../../types/pagina';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';

export default function AdminPaginas() {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [filteredPaginas, setFilteredPaginas] = useState<Pagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPaginas();
  }, []);

  useEffect(() => {
    // Filtrar páginas por término de búsqueda
    const filtered = paginas.filter(pagina => 
      (pagina.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pagina.resumen?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pagina.url?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
    setFilteredPaginas(filtered);
  }, [paginas, searchTerm]);

  const loadPaginas = async () => {
    try {
      setLoading(true);
      const data = await paginaService.getPaginas();
      setPaginas(data);
    } catch (err: any) {
      console.error('Error loading páginas:', err);
      setError('Error al cargar las páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id: number, currentStatus: boolean) => {
    try {
      await paginaService.togglePublished(id, !currentStatus);
      setPaginas(paginas.map(pagina => 
        pagina.id === id 
          ? { ...pagina, publicado: !currentStatus }
          : pagina
      ));
    } catch (err: any) {
      console.error('Error toggling published status:', err);
      setError('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta página?')) {
      return;
    }

    try {
      setDeletingId(id);
      await paginaService.deletePagina(id);
      setPaginas(paginas.filter(pagina => pagina.id !== id));
    } catch (err: any) {
      console.error('Error deleting página:', err);
      setError('Error al eliminar la página');
    } finally {
      setDeletingId(null);
    }
  };

  const truncateText = (text: string | null, length: number = 100): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Páginas</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar páginas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button asChild>
            <Link to="/admin/paginas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Página
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{paginas.length}</p>
              <p className="text-sm text-gray-500">Total de páginas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {paginas.filter(p => p.publicado).length}
              </p>
              <p className="text-sm text-gray-500">Publicadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {paginas.filter(p => !p.publicado).length}
              </p>
              <p className="text-sm text-gray-500">Borradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de páginas */}
      {filteredPaginas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron páginas' : 'No hay páginas'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primera página.'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/admin/paginas/nueva">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Página
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPaginas.map((pagina) => (
            <Card key={pagina.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Imagen thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                      {pagina.imagen ? (
                        <img
                          src={pagina.imagen}
                          alt={pagina.titulo || 'Página'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {pagina.titulo || 'Sin título'}
                      </h3>
                      <Badge variant={pagina.publicado ? 'default' : 'secondary'}>
                        {pagina.publicado ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {truncateText(pagina.resumen)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {pagina.url && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          /{pagina.url}
                        </span>
                      )}
                      <span>
                        Creado: {new Date(pagina.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublished(pagina.id, pagina.publicado)}
                      title={pagina.publicado ? 'Despublicar' : 'Publicar'}
                    >
                      {pagina.publicado ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild title="Editar">
                      <Link to={`/admin/paginas/${pagina.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pagina.id)}
                      disabled={deletingId === pagina.id}
                      title="Eliminar"
                    >
                      {deletingId === pagina.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}