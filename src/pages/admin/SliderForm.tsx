// src/pages/admin/SliderForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { sliderService } from '../../services/sliderService';
import { StorageService, STORAGE_BUCKETS } from '../../services/storageService';
import type { SliderFormData } from '../../types/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';

const initialFormData: SliderFormData = {
  titulo: '',
  subtitulo: '',
  extra: '',
  boton_texto: '',
  boton_enlace: '',
  en_titulo: '',
  en_subtitulo: '',
  en_extra: '',
  en_boton_texto: '',
  imagen: '',
  logo: '',
  publicado: false
};

export default function SliderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<SliderFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [loadingSlider, setLoadingSlider] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadSlider(parseInt(id));
    }
  }, [id, isEditing]);

  const loadSlider = async (sliderId: number) => {
    try {
      setLoadingSlider(true);
      const slider = await sliderService.getSliderById(sliderId);
      
      if (!slider) {
        setError('Slider no encontrado');
        return;
      }
      
      setFormData({
        titulo: slider.titulo || '',
        subtitulo: slider.subtitulo || '',
        extra: slider.extra || '',
        boton_texto: slider.boton_texto || '',
        boton_enlace: slider.boton_enlace || '',
        en_titulo: slider.en_titulo || '',
        en_subtitulo: slider.en_subtitulo || '',
        en_extra: slider.en_extra || '',
        en_boton_texto: slider.en_boton_texto || '',
        imagen: slider.imagen || '',
        logo: slider.logo || '',
        publicado: slider.publicado || false
      });
    } catch (err: any) {
      console.error('Error loading slider:', err);
      setError('Error al cargar el slider');
    } finally {
      setLoadingSlider(false);
    }
  };

  const handleInputChange = (field: keyof SliderFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSwitchChange = (field: keyof SliderFormData) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isEditing && id) {
        await sliderService.updateSlider(parseInt(id), formData);
        setSuccess('Slider actualizado correctamente');
      } else {
        await sliderService.createSlider(formData);
        setSuccess('Slider creado correctamente');
      }

      // Redirigir después de un breve delay para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/admin/sliders');
      }, 1500);

    } catch (err: any) {
      console.error('Error saving slider:', err);
      setError(isEditing ? 'Error al actualizar el slider' : 'Error al crear el slider');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  const handleImageUpload = async (file: File, type: 'imagen' | 'logo') => {
    try {
      const setUploading = type === 'imagen' ? setUploadingImage : setUploadingLogo;
      setUploading(true);
      setError(null);

      // Validar archivo
      const validation = StorageService.validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Archivo no válido');
        return;
      }

      // Generar nombre único
      const fileName = StorageService.generateFileName(file.name, type);
      
      // Subir archivo
      const publicUrl = await StorageService.uploadFile(
        STORAGE_BUCKETS.SLIDERS,
        fileName,
        file,
        { upsert: true }
      );

      // Actualizar form data
      setFormData(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      setSuccess(`${type === 'imagen' ? 'Imagen' : 'Logo'} subido correctamente`);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(`Error al subir ${type === 'imagen' ? 'imagen' : 'logo'}: ${err.message}`);
    } finally {
      const setUploading = type === 'imagen' ? setUploadingImage : setUploadingLogo;
      setUploading(false);
    }
  };

  const handleFileInputChange = (type: 'imagen' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  if (loadingSlider) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/sliders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Slider' : 'Nuevo Slider'}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Slider</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección Español */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Contenido en Español
                  </h3>
                  
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo">
                      Título <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange('titulo')}
                      placeholder="Título principal del slider"
                      required
                    />
                  </div>

                  {/* Subtítulo */}
                  <div className="space-y-2">
                    <Label htmlFor="subtitulo">Subtítulo</Label>
                    <Textarea
                      id="subtitulo"
                      value={formData.subtitulo}
                      onChange={handleInputChange('subtitulo')}
                      placeholder="Descripción o subtítulo del slider"
                      rows={3}
                    />
                  </div>

                  {/* Extra */}
                  <div className="space-y-2">
                    <Label htmlFor="extra">Texto Extra</Label>
                    <Textarea
                      id="extra"
                      value={formData.extra}
                      onChange={handleInputChange('extra')}
                      placeholder="Texto adicional o descripción extendida"
                      rows={2}
                    />
                  </div>

                  {/* Botón */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="boton_texto">Texto del Botón</Label>
                      <Input
                        id="boton_texto"
                        value={formData.boton_texto}
                        onChange={handleInputChange('boton_texto')}
                        placeholder="Ver más"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boton_enlace">Enlace del Botón</Label>
                      <Input
                        id="boton_enlace"
                        value={formData.boton_enlace}
                        onChange={handleInputChange('boton_enlace')}
                        placeholder="https://ejemplo.com"
                        type="url"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección Inglés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Contenido en Inglés
                  </h3>
                  
                  {/* Título en inglés */}
                  <div className="space-y-2">
                    <Label htmlFor="en_titulo">Title (English)</Label>
                    <Input
                      id="en_titulo"
                      value={formData.en_titulo}
                      onChange={handleInputChange('en_titulo')}
                      placeholder="Main title for the slider"
                    />
                  </div>

                  {/* Subtítulo en inglés */}
                  <div className="space-y-2">
                    <Label htmlFor="en_subtitulo">Subtitle (English)</Label>
                    <Textarea
                      id="en_subtitulo"
                      value={formData.en_subtitulo}
                      onChange={handleInputChange('en_subtitulo')}
                      placeholder="Description or subtitle for the slider"
                      rows={3}
                    />
                  </div>

                  {/* Extra en inglés */}
                  <div className="space-y-2">
                    <Label htmlFor="en_extra">Extra Text (English)</Label>
                    <Textarea
                      id="en_extra"
                      value={formData.en_extra}
                      onChange={handleInputChange('en_extra')}
                      placeholder="Additional text or extended description"
                      rows={2}
                    />
                  </div>

                  {/* Botón en inglés */}
                  <div className="space-y-2">
                    <Label htmlFor="en_boton_texto">Button Text (English)</Label>
                    <Input
                      id="en_boton_texto"
                      value={formData.en_boton_texto}
                      onChange={handleInputChange('en_boton_texto')}
                      placeholder="Learn more"
                    />
                  </div>
                </div>

                {/* Sección Imágenes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Imágenes
                  </h3>

                  {/* Imagen principal */}
                  <div className="space-y-4">
                    <Label>Imagen Principal</Label>
                    
                    {/* Subida de archivo */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="imagen-file" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                            <div className="text-center">
                              {uploadingImage ? (
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-500">Subiendo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-600">
                                    Haz clic para subir imagen principal
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG, WebP hasta 5MB</p>
                                </>
                              )}
                            </div>
                          </div>
                        </Label>
                        <input
                          id="imagen-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange('imagen')}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </div>
                      
                      <div className="text-gray-400 text-sm">o</div>
                      
                      {/* URL manual */}
                      <div className="flex-1">
                        <Input
                          value={formData.imagen}
                          onChange={handleInputChange('imagen')}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          type="url"
                          disabled={uploadingImage}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          O ingresa URL directamente
                        </p>
                      </div>
                    </div>

                    {/* Preview de imagen */}
                    {formData.imagen && (
                      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.imagen}
                          alt="Preview imagen principal"
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Logo */}
                  <div className="space-y-4">
                    <Label>Logo (Opcional)</Label>
                    
                    {/* Subida de archivo */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="logo-file" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                            <div className="text-center">
                              {uploadingLogo ? (
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-500">Subiendo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="mx-auto h-6 w-6 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-600">
                                    Haz clic para subir logo
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG, WebP hasta 5MB</p>
                                </>
                              )}
                            </div>
                          </div>
                        </Label>
                        <input
                          id="logo-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange('logo')}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                      </div>
                      
                      <div className="text-gray-400 text-sm">o</div>
                      
                      {/* URL manual */}
                      <div className="flex-1">
                        <Input
                          value={formData.logo}
                          onChange={handleInputChange('logo')}
                          placeholder="https://ejemplo.com/logo.png"
                          type="url"
                          disabled={uploadingLogo}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          O ingresa URL directamente
                        </p>
                      </div>
                    </div>

                    {/* Preview de logo */}
                    {formData.logo && (
                      <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={formData.logo}
                          alt="Preview logo"
                          className="w-full h-full object-contain p-2"
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Eliminar logo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={handleSwitchChange('publicado')}
                  />
                  <Label htmlFor="publicado">Publicar slider</Label>
                </div>

                {/* Botones */}
                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || uploadingImage || uploadingLogo}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? 'Actualizar Slider' : 'Crear Slider'}
                      </>
                    )}
                  </Button>
                  
                  <Button type="button" variant="outline" asChild>
                    <Link to="/admin/sliders">Cancelar</Link>
                  </Button>
                  
                  {(uploadingImage || uploadingLogo) && (
                    <span className="text-sm text-gray-500">
                      Subiendo archivos...
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview de la imagen */}
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {formData.imagen ? (
                    <img
                      src={formData.imagen}
                      alt={formData.titulo || 'Preview'}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {formData.logo && (
                    <div className="absolute bottom-2 left-2">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="h-6 w-auto bg-white p-1 rounded shadow-sm"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </div>

                {/* Preview del contenido */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">
                    {formData.titulo || 'Título del slider'}
                  </h3>
                  
                  {formData.subtitulo && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {formData.subtitulo}
                    </p>
                  )}
                  
                  {formData.extra && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {formData.extra}
                    </p>
                  )}
                  
                  {formData.boton_texto && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded">
                        {formData.boton_texto}
                      </span>
                    </div>
                  )}

                  {/* Separador si hay contenido en inglés */}
                  {(formData.en_titulo || formData.en_subtitulo || formData.en_extra) && (
                    <div className="border-t pt-2 mt-3">
                      <p className="text-xs font-medium text-gray-400 mb-2">English</p>
                      
                      {formData.en_titulo && (
                        <h4 className="font-medium text-xs text-gray-700">
                          {formData.en_titulo}
                        </h4>
                      )}
                      
                      {formData.en_subtitulo && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {formData.en_subtitulo}
                        </p>
                      )}
                      
                      {formData.en_extra && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                          {formData.en_extra}
                        </p>
                      )}
                      
                      {formData.en_boton_texto && (
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-gray-600 text-white text-xs rounded">
                            {formData.en_boton_texto}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div className="pt-2 border-t">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    formData.publicado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}