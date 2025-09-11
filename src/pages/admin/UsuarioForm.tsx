// src/pages/admin/UsuarioForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Mail,
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { usuarioService } from '../../services/usuarioService';
import type { Usuario, UsuarioCreateData, UsuarioUpdateData } from '../../types/usuario';

export default function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    phone: ''
  });

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadUsuario(id);
    }
  }, [id, isEditing]);

  const loadUsuario = async (userId: string) => {
    try {
      setLoading(true);
      const userData = await usuarioService.getUsuarioById(userId);
      
      if (userData) {
        setUsuario(userData);
        setFormData({
          email: userData.email || '',
          password: '',
          confirmPassword: '',
          nombre: userData.user_metadata?.nombre || '',
          apellido: userData.user_metadata?.apellido || '',
          phone: userData.phone || ''
        });
      } else {
        showNotification('error', 'Usuario no encontrado');
        navigate('/admin/usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      showNotification('error', 'Error cargando usuario');
      navigate('/admin/usuarios');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Password (requerido solo para nuevos usuarios)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else {
      // Para edición, validar solo si se proporciona nueva contraseña
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Teléfono (opcional pero debe ser válido si se proporciona)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isEditing && id) {
        // Actualizar usuario existente
        const updateData: UsuarioUpdateData = {
          email: formData.email,
          nombre: formData.nombre || undefined,
          apellido: formData.apellido || undefined,
          phone: formData.phone || undefined
        };

        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }

        await usuarioService.updateUsuario(id, updateData);
        showNotification('success', 'Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const createData: UsuarioCreateData = {
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre || undefined,
          apellido: formData.apellido || undefined,
          phone: formData.phone || undefined,
          email_confirm: true // Confirmar email automáticamente
        };

        await usuarioService.createUsuario(createData);
        showNotification('success', 'Usuario creado exitosamente');
      }

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 1500);

    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      showNotification('error', error.message || 'Error guardando usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Confirmar email manualmente (solo para edición)
  const handleConfirmarEmail = async () => {
    if (!isEditing || !id) return;

    try {
      await usuarioService.confirmarEmail(id);
      showNotification('success', 'Email confirmado exitosamente');
      loadUsuario(id); // Recargar datos
    } catch (error) {
      console.error('Error confirmando email:', error);
      showNotification('error', 'Error confirmando email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Modifica los datos del usuario' : 'Crea una nueva cuenta de usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nombre del usuario"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Apellido del usuario"
                  />
                  {errors.apellido && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+52 55 1234 5678"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </h3>
              
              {isEditing && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Deja los campos de contraseña vacíos si no quieres cambiarla
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {!isEditing && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña {!isEditing && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirmar contraseña"
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/usuarios')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Usuario')}
              </button>
            </div>
          </form>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado del usuario (solo para edición) */}
          {isEditing && usuario && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Estado del Usuario
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email confirmado</span>
                  <div className="flex items-center gap-2">
                    {usuario.email_confirmed_at ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Sí
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          No
                        </span>
                        <button
                          onClick={handleConfirmarEmail}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Confirmar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fecha de registro</span>
                  <span className="text-sm text-gray-900">
                    {new Date(usuario.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último acceso</span>
                  <span className="text-sm text-gray-900">
                    {usuario.last_sign_in_at 
                      ? new Date(usuario.last_sign_in_at).toLocaleDateString('es-MX')
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Información de ayuda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              💡 Consejos
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Use emails únicos para cada usuario</li>
              <li>• Las contraseñas deben tener al menos 6 caracteres</li>
              {isEditing && (
                <li>• Los usuarios con email confirmado pueden iniciar sesión</li>
              )}
              <li>• El teléfono es opcional pero útil para contacto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}