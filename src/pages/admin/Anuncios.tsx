// src/pages/admin/Anuncios.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  Image,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { anuncioService } from '../../services/anuncioService';
import type { Anuncio, AnuncioFilters, AnuncioStats } from '../../types/anuncio';

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [stats, setStats] = useState<AnuncioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AnuncioFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [anunciosData, statsData] = await Promise.all([
        anuncioService.getAnuncios({ ...filters, search: searchQuery }),
        anuncioService.getStats()
      ]);
      setAnuncios(anunciosData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar anuncios
  const handleSearch = async () => {
    setLoading(true);
    try {
      const anunciosData = await anuncioService.getAnuncios({ 
        ...filters, 
        search: searchQuery 
      });
      setAnuncios(anunciosData);
    } catch (error) {
      console.error('Error buscando anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado activo
  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await anuncioService.toggleActive(id, active);
      loadData();
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  // Eliminar anuncio
  const handleEliminarAnuncio = async () => {
    if (!selectedAnuncio) return;
    
    try {
      await anuncioService.deleteAnuncio(selectedAnuncio.id);
      setShowDeleteModal(false);
      setSelectedAnuncio(null);
      loadData();
    } catch (error) {
      console.error('Error eliminando anuncio:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener estado del anuncio
  const getAnuncioStatus = (anuncio: Anuncio) => {
    if (!anuncio.active) {
      return { status: 'inactivo', color: 'gray', text: 'Inactivo' };
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (anuncio.start_date > today) {
      return { status: 'programado', color: 'blue', text: 'Programado' };
    }
    
    if (anuncio.end_date < today) {
      return { status: 'expirado', color: 'red', text: 'Expirado' };
    }
    
    return { status: 'vigente', color: 'green', text: 'Vigente' };
  };

  if (loading && !anuncios.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anuncios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los anuncios emergentes del sitio web
          </p>
        </div>
        <Link
          to="/admin/anuncios/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Anuncio
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vigentes</p>
                <p className="text-3xl font-bold text-green-600">{stats.vigentes}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programados</p>
                <p className="text-3xl font-bold text-blue-600">{stats.programados}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expirados</p>
                <p className="text-3xl font-bold text-red-600">{stats.expirados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactivos}</p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Buscar
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.active?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    active: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filters.fecha_desde || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    fecha_desde: e.target.value || undefined
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                    loadData();
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de anuncios */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anuncio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imágenes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {anuncios.map((anuncio) => {
                const status = getAnuncioStatus(anuncio);
                
                return (
                  <tr key={anuncio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {anuncio.titulo_es || anuncio.titulo_en || 'Sin título'}
                        </div>
                        {anuncio.link && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <a 
                              href={anuncio.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 truncate max-w-xs"
                            >
                              {anuncio.link}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.text}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(anuncio.start_date)}</span>
                        <span>-</span>
                        <span>{formatDate(anuncio.end_date)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {anuncio.img_es && (
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">ES</span>
                          </div>
                        )}
                        {anuncio.img_en && (
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-green-800">EN</span>
                          </div>
                        )}
                        {!anuncio.img_es && !anuncio.img_en && (
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(anuncio.id, !anuncio.active)}
                          className={`transition-colors ${
                            anuncio.active 
                              ? 'text-green-600 hover:text-green-900' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={anuncio.active ? 'Desactivar' : 'Activar'}
                        >
                          {anuncio.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        
                        <Link
                          to={`/admin/anuncios/${anuncio.id}/editar`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => {
                            setSelectedAnuncio(anuncio);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {anuncios.length === 0 && !loading && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay anuncios
            </h3>
            <p className="text-gray-500">
              {searchQuery || Object.keys(filters).length > 0
                ? 'No se encontraron anuncios con los criterios de búsqueda.'
                : 'Comienza creando tu primer anuncio.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedAnuncio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Eliminar Anuncio
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar el anuncio{' '}
              <strong>{selectedAnuncio.titulo_es || selectedAnuncio.titulo_en || 'sin título'}</strong>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAnuncio(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarAnuncio}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}