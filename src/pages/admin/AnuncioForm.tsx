// src/pages/admin/AnuncioForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Calendar,
  ExternalLink,
  Image,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { anuncioService } from '../../services/anuncioService';
import { StorageService, STORAGE_BUCKETS } from '../../services/storageService';
import type { Anuncio, AnuncioFormData } from '../../types/anuncio';

export default function AnuncioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<AnuncioFormData>({
    img_es: '',
    img_en: '',
    titulo_es: '',
    titulo_en: '',
    link: '',
    start_date: '',
    end_date: '',
    active: true
  });

  const [_anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ es: false, en: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Cargar anuncio si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadAnuncio(parseInt(id));
    } else {
      // Establecer fechas por defecto para nuevo anuncio
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setFormData(prev => ({
        ...prev,
        start_date: today,
        end_date: nextWeek.toISOString().split('T')[0]
      }));
    }
  }, [id, isEditing]);

  const loadAnuncio = async (anuncioId: number) => {
    try {
      setLoading(true);
      const anuncioData = await anuncioService.getAnuncioById(anuncioId);
      
      if (anuncioData) {
        setAnuncio(anuncioData);
        setFormData({
          img_es: anuncioData.img_es || '',
          img_en: anuncioData.img_en || '',
          titulo_es: anuncioData.titulo_es || '',
          titulo_en: anuncioData.titulo_en || '',
          link: anuncioData.link || '',
          start_date: anuncioData.start_date,
          end_date: anuncioData.end_date,
          active: anuncioData.active
        });
      } else {
        showNotification('error', 'Anuncio no encontrado');
        navigate('/admin/anuncios');
      }
    } catch (error) {
      console.error('Error cargando anuncio:', error);
      showNotification('error', 'Error cargando anuncio');
      navigate('/admin/anuncios');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileUpload = async (file: File, language: 'es' | 'en') => {
    try {
      setUploading(prev => ({ ...prev, [language]: true }));

      // Validar archivo
      const validation = StorageService.validateImageFile(file);
      if (!validation.valid) {
        showNotification('error', validation.error || 'Archivo no válido');
        return;
      }

      // Generar nombre único
      const fileName = StorageService.generateFileName(file.name, `anuncio-${language}`);
      
      // Subir archivo
      const imageUrl = await StorageService.uploadFile(
        STORAGE_BUCKETS.GENERAL,
        `anuncios/${fileName}`,
        file,
        { upsert: true }
      );

      // Actualizar estado
      setFormData(prev => ({
        ...prev,
        [`img_${language}`]: imageUrl
      }));

      showNotification('success', `Imagen en ${language.toUpperCase()} subida exitosamente`);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      showNotification('error', 'Error subiendo imagen');
    } finally {
      setUploading(prev => ({ ...prev, [language]: false }));
    }
  };

  const handleRemoveImage = (language: 'es' | 'en') => {
    setFormData(prev => ({
      ...prev,
      [`img_${language}`]: ''
    }));
  };

  const validateForm = (): boolean => {
    const validation = anuncioService.validateAnuncioData(formData);
    
    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error, index) => {
        newErrors[`error_${index}`] = error;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isEditing && id) {
        await anuncioService.updateAnuncio(parseInt(id), formData);
        showNotification('success', 'Anuncio actualizado exitosamente');
      } else {
        await anuncioService.createAnuncio(formData);
        showNotification('success', 'Anuncio creado exitosamente');
      }

      setTimeout(() => {
        navigate('/admin/anuncios');
      }, 1500);

    } catch (error: any) {
      console.error('Error guardando anuncio:', error);
      showNotification('error', error.message || 'Error guardando anuncio');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AnuncioFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores
    setErrors({});
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
            onClick={() => navigate('/admin/anuncios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Modifica los datos del anuncio' : 'Crea un nuevo anuncio emergente'}
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

      {/* Errores de validación */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Errores de validación:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imágenes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Imágenes del Anuncio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagen Español */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Español
                  </label>
                  {formData.img_es ? (
                    <div className="relative">
                      <img
                        src={formData.img_es}
                        alt="Preview español"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('es')}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Subir imagen en español</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'es');
                        }}
                        className="hidden"
                        id="upload-es"
                        disabled={uploading.es}
                      />
                      <label
                        htmlFor="upload-es"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                          uploading.es ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading.es ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Seleccionar archivo
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Imagen Inglés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Inglés
                  </label>
                  {formData.img_en ? (
                    <div className="relative">
                      <img
                        src={formData.img_en}
                        alt="Preview inglés"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('en')}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Subir imagen en inglés</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'en');
                        }}
                        className="hidden"
                        id="upload-en"
                        disabled={uploading.en}
                      />
                      <label
                        htmlFor="upload-en"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                          uploading.en ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading.en ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Seleccionar archivo
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Títulos */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Títulos del Anuncio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título Español
                  </label>
                  <input
                    type="text"
                    value={formData.titulo_es}
                    onChange={(e) => handleInputChange('titulo_es', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Título del anuncio en español"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título Inglés
                  </label>
                  <input
                    type="text"
                    value={formData.titulo_en}
                    onChange={(e) => handleInputChange('titulo_en', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Título del anuncio en inglés"
                  />
                </div>
              </div>
            </div>

            {/* Enlace */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Enlace del Anuncio
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (opcional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://ejemplo.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si se proporciona, el anuncio será clickeable y redirigirá a esta URL
                </p>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Configuración */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configuración
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Estado activo
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('active', !formData.active)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      formData.active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {formData.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {formData.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Información de ayuda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                💡 Consejos
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Se requiere al menos una imagen (español o inglés)</li>
                <li>• Se requiere al menos un título (español o inglés)</li>
                <li>• El anuncio se mostrará entre las fechas especificadas</li>
                <li>• Solo se muestra un anuncio a la vez (el más reciente)</li>
                <li>• El enlace es opcional pero debe ser una URL válida</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/anuncios')}
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
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Anuncio' : 'Crear Anuncio')}
          </button>
        </div>
      </form>
    </div>
  );
}