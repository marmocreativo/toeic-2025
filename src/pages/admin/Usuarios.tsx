// src/pages/admin/Usuarios.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { usuarioService } from '../../services/usuarioService';
import type { Usuario, UsuarioFilters, UsuarioStats } from '../../types/usuario';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<UsuarioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UsuarioFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosData, statsData] = await Promise.all([
        usuarioService.getUsuarios({ ...filters, search: searchQuery }),
        usuarioService.getStats()
      ]);
      setUsuarios(usuariosData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios
  const handleSearch = async () => {
    setLoading(true);
    try {
      const usuariosData = await usuarioService.getUsuarios({ 
        ...filters, 
        search: searchQuery 
      });
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar email
  const handleConfirmarEmail = async (id: string) => {
    try {
      await usuarioService.confirmarEmail(id);
      loadData();
    } catch (error) {
      console.error('Error confirmando email:', error);
    }
  };

  // Suspender usuario
  const handleSuspenderUsuario = async (id: string) => {
    try {
      await usuarioService.suspenderUsuario(id);
      loadData();
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
    }
  };

  //log para evitar error tsx
  console.log(handleSuspenderUsuario);

  // Reactivar usuario
  const handleReactivarUsuario = async (id: string) => {
    try {
      await usuarioService.reactivarUsuario(id);
      loadData();
    } catch (error) {
      console.error('Error reactivando usuario:', error);
    }
  };
  console.log(handleReactivarUsuario);

  // Eliminar usuario
  const handleEliminarUsuario = async () => {
    if (!selectedUser) return;
    
    try {
      await usuarioService.deleteUsuario(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener estado del usuario
  const getUserStatus = (usuario: Usuario) => {
    const estado = usuarioService.getUsuarioEstado(usuario);
    
    if (!estado.confirmado) {
      return { status: 'pendiente', color: 'yellow', text: 'Pendiente' };
    }
    if (!estado.activo) {
      return { status: 'inactivo', color: 'gray', text: 'Inactivo' };
    }
    return { status: 'activo', color: 'green', text: 'Activo' };
  };

  if (loading && !usuarios.length) {
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
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra las cuentas de usuario del sistema
          </p>
        </div>
        <Link
          to="/admin/usuarios/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activos}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
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
              placeholder="Buscar por email, nombre..."
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
                  value={filters.confirmado?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    confirmado: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Todos</option>
                  <option value="true">Confirmados</option>
                  <option value="false">Pendientes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actividad
                </label>
                <select
                  value={filters.activo?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    activo: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos (30 días)</option>
                  <option value="false">Inactivos</option>
                </select>
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

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => {
                const status = getUserStatus(usuario);
                const nombreCompleto = usuarioService.getFullName(usuario);
                
                return (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {nombreCompleto}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {usuario.email}
                        </div>
                        {usuario.phone && (
                          <div className="text-sm text-gray-500">
                            📱 {usuario.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.text}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usuario.created_at)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usuario.last_sign_in_at)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!usuario.email_confirmed_at && (
                          <button
                            onClick={() => handleConfirmarEmail(usuario.id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Confirmar email"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <Link
                          to={`/admin/usuarios/${usuario.id}/editar`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(usuario);
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

        {usuarios.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios
            </h3>
            <p className="text-gray-500">
              {searchQuery || Object.keys(filters).length > 0
                ? 'No se encontraron usuarios con los criterios de búsqueda.'
                : 'Comienza creando tu primer usuario.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Eliminar Usuario
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar al usuario{' '}
              <strong>{usuarioService.getFullName(selectedUser)}</strong>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarUsuario}
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