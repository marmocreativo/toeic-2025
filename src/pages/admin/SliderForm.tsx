// src/pages/admin/SliderForm.tsx - Versión con upload de archivos
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sliderService } from '../../services/sliderService';
import { useFileUpload } from '../../hooks/useFileUpload';
import { STORAGE_BUCKETS } from '../../services/storageService';
import type { SliderFormData } from '../../types/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '../../components/ui/FileUpload';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

export default function SliderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<SliderFormData>({
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
    publicado: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks para upload de archivos
  const imageUpload = useFileUpload({
    bucket: STORAGE_BUCKETS.SLIDERS,
    folder: 'images',
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, imagen: url }));
      setError(null); // Limpiar errores al subir exitosamente
    },
    onError: (error) => {
      setError(`Error subiendo imagen: ${error}`);
    }
  });

  const logoUpload = useFileUpload({
    bucket: STORAGE_BUCKETS.SLIDERS,
    folder: 'logos',
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, logo: url }));
      setError(null); // Limpiar errores al subir exitosamente
    },
    onError: (error) => {
      setError(`Error subiendo logo: ${error}`);
    }
  });

  useEffect(() => {
    if (isEditing && id) {
      loadSlider(parseInt(id));
    }
  }, [id, isEditing]);

  const loadSlider = async (sliderId: number) => {
    try {
      setLoading(true);
      const slider = await sliderService.getSliderById(sliderId);
      if (slider) {
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
          publicado: slider.publicado,
        });
      }
    } catch (err: any) {
      console.error('Error loading slider:', err);
      setError('Error al cargar el slider');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing && id) {
        await sliderService.updateSlider(parseInt(id), formData);
      } else {
        await sliderService.createSlider(formData);
      }
      navigate('/admin/sliders');
    } catch (err: any) {
      console.error('Error saving slider:', err);
      setError('Error al guardar el slider');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof SliderFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/sliders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Slider' : 'Nuevo Slider'}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Slider</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spanish" className="space-y-6">
              <TabsList>
                <TabsTrigger value="spanish">Español</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="media">Imágenes</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>

              <TabsContent value="spanish" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Título principal del slider"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subtitulo">Subtítulo</Label>
                    <Textarea
                      id="subtitulo"
                      value={formData.subtitulo}
                      onChange={(e) => handleInputChange('subtitulo', e.target.value)}
                      placeholder="Descripción o subtítulo"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="extra">Texto Extra</Label>
                    <Input
                      id="extra"
                      value={formData.extra}
                      onChange={(e) => handleInputChange('extra', e.target.value)}
                      placeholder="Información adicional"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="boton_texto">Texto del Botón</Label>
                      <Input
                        id="boton_texto"
                        value={formData.boton_texto}
                        onChange={(e) => handleInputChange('boton_texto', e.target.value)}
                        placeholder="Ej: Ver más"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="boton_enlace">Enlace del Botón</Label>
                      <Input
                        id="boton_enlace"
                        value={formData.boton_enlace}
                        onChange={(e) => handleInputChange('boton_enlace', e.target.value)}
                        placeholder="Ej: /examenes"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="english" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="en_titulo">Title (English)</Label>
                    <Input
                      id="en_titulo"
                      value={formData.en_titulo}
                      onChange={(e) => handleInputChange('en_titulo', e.target.value)}
                      placeholder="English title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="en_subtitulo">Subtitle (English)</Label>
                    <Textarea
                      id="en_subtitulo"
                      value={formData.en_subtitulo}
                      onChange={(e) => handleInputChange('en_subtitulo', e.target.value)}
                      placeholder="English description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="en_extra">Extra Text (English)</Label>
                    <Input
                      id="en_extra"
                      value={formData.en_extra}
                      onChange={(e) => handleInputChange('en_extra', e.target.value)}
                      placeholder="Additional information in English"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="en_boton_texto">Button Text (English)</Label>
                    <Input
                      id="en_boton_texto"
                      value={formData.en_boton_texto}
                      onChange={(e) => handleInputChange('en_boton_texto', e.target.value)}
                      placeholder="Ex: Learn more"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="space-y-6">
                  {/* Upload de Imagen Principal */}
                  <div>
                    <Label className="text-base font-medium">Imagen Principal</Label>
                    <FileUpload
                      onFileSelect={imageUpload.uploadFile}
                      onRemove={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                      preview={formData.imagen}
                      uploading={imageUpload.uploading}
                      progress={imageUpload.progress}
                      error={imageUpload.error}
                      label="Subir imagen principal"
                      disabled={saving}
                    />
                    
                    {/* Opción manual de URL */}
                    <div className="mt-4">
                      <Label htmlFor="imagen">O ingresa URL manualmente</Label>
                      <Input
                        id="imagen"
                        value={formData.imagen}
                        onChange={(e) => handleInputChange('imagen', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>
                  
                  {/* Upload de Logo */}
                  <div>
                    <Label className="text-base font-medium">Logo</Label>
                    <FileUpload
                      onFileSelect={logoUpload.uploadFile}
                      onRemove={() => setFormData(prev => ({ ...prev, logo: '' }))}
                      preview={formData.logo}
                      uploading={logoUpload.uploading}
                      progress={logoUpload.progress}
                      error={logoUpload.error}
                      label="Subir logo"
                      disabled={saving}
                    />
                    
                    {/* Opción manual de URL */}
                    <div className="mt-4">
                      <Label htmlFor="logo">O ingresa URL manualmente</Label>
                      <Input
                        id="logo"
                        value={formData.logo}
                        onChange={(e) => handleInputChange('logo', e.target.value)}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={(checked) => handleInputChange('publicado', checked)}
                  />
                  <Label htmlFor="publicado">Publicar slider</Label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/sliders')}
                disabled={saving || imageUpload.uploading || logoUpload.uploading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving || imageUpload.uploading || logoUpload.uploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Actualizar' : 'Crear'} Slider
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}