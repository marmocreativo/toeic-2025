import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paginaService } from '../../services/paginaService';
import { useFileUpload } from '../../hooks/useFileUpload';
import { STORAGE_BUCKETS } from '../../services/storageService';
import type { PaginaFormData } from '../../types/pagina';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '../../components/ui/FileUpload';
import { WysiwygEditor } from '../../components/ui/WysiwygEditor';
import { Loader2, Save, ArrowLeft, Link2 } from 'lucide-react';

export default function PaginaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<PaginaFormData>({
    titulo: '',
    resumen: '',
    contenido: '',
    en_titulo: '',
    en_resumen: '',
    en_contenido: '',
    imagen: '',
    url: '',
    en_url: '',
    publicado: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook para upload de imagen
  const imageUpload = useFileUpload({
    bucket: STORAGE_BUCKETS.GENERAL,
    folder: 'paginas',
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, imagen: url }));
      setError(null);
    },
    onError: (error) => {
      setError(`Error subiendo imagen: ${error}`);
    }
  });

  useEffect(() => {
    if (isEditing && id) {
      loadPagina(parseInt(id));
    }
  }, [id, isEditing]);

  // Auto-generar URL cuando cambia el título
  useEffect(() => {
    if (!isEditing && formData.titulo && !formData.url) {
      const slug = paginaService.generateSlug(formData.titulo);
      setFormData(prev => ({ ...prev, url: slug }));
    }
  }, [formData.titulo, isEditing]);

  const loadPagina = async (paginaId: number) => {
    try {
      setLoading(true);
      const pagina = await paginaService.getPaginaById(paginaId);
      if (pagina) {
        setFormData({
          titulo: pagina.titulo || '',
          resumen: pagina.resumen || '',
          contenido: pagina.contenido || '',
          en_titulo: pagina.en_titulo || '',
          en_resumen: pagina.en_resumen || '',
          en_contenido: pagina.en_contenido || '',
          imagen: pagina.imagen || '',
          url: pagina.url || '',
          en_url: pagina.en_url || '',
          publicado: pagina.publicado,
        });
      }
    } catch (err: any) {
      console.error('Error loading página:', err);
      setError('Error al cargar la página');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      setSaving(false);
      return;
    }

    if (!formData.url.trim()) {
      setError('La URL es requerida');
      setSaving(false);
      return;
    }

    try {
      if (isEditing && id) {
        await paginaService.updatePagina(parseInt(id), formData);
      } else {
        await paginaService.createPagina(formData);
      }
      navigate('/admin/paginas');
    } catch (err: any) {
      console.error('Error saving página:', err);
      if (err.message?.includes('duplicate')) {
        setError('Ya existe una página con esa URL');
      } else {
        setError('Error al guardar la página');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof PaginaFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlugFromTitle = () => {
    if (formData.titulo) {
      const slug = paginaService.generateSlug(formData.titulo);
      setFormData(prev => ({ ...prev, url: slug }));
    }
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
        <Button variant="outline" onClick={() => navigate('/admin/paginas')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Página' : 'Nueva Página'}
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
            <CardTitle>Información de la Página</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spanish" className="space-y-6">
              <TabsList>
                <TabsTrigger value="spanish">Español</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="media">Imagen</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>

              <TabsContent value="spanish" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Título de la página"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="resumen">Resumen</Label>
                    <Textarea
                      id="resumen"
                      value={formData.resumen}
                      onChange={(e) => handleInputChange('resumen', e.target.value)}
                      placeholder="Descripción breve de la página"
                      rows={3}
                    />
                  </div>
                  
                  {/* REEMPLAZAR EL TEXTAREA DE CONTENIDO CON WYSIWYG */}
                  <div>
                    <WysiwygEditor
                      label="Contenido"
                      content={formData.contenido}
                      onChange={(content) => handleInputChange('contenido', content)}
                      placeholder="Contenido completo de la página..."
                      className="min-h-[400px]"
                    />
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
                      placeholder="Page title in English"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="en_resumen">Summary (English)</Label>
                    <Textarea
                      id="en_resumen"
                      value={formData.en_resumen}
                      onChange={(e) => handleInputChange('en_resumen', e.target.value)}
                      placeholder="Brief description in English"
                      rows={3}
                    />
                  </div>
                  
                  {/* REEMPLAZAR EL TEXTAREA DE EN_CONTENIDO CON WYSIWYG */}
                  <div>
                    <WysiwygEditor
                      label="Content (English)"
                      content={formData.en_contenido}
                      onChange={(content) => handleInputChange('en_contenido', content)}
                      placeholder="Full content in English..."
                      className="min-h-[400px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="en_url">URL (English)</Label>
                    <Input
                      id="en_url"
                      value={formData.en_url}
                      onChange={(e) => handleInputChange('en_url', e.target.value)}
                      placeholder="english-page-url"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="media" className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Imagen de la Página</Label>
                  <FileUpload
                    onFileSelect={imageUpload.uploadFile}
                    onRemove={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                    preview={formData.imagen}
                    uploading={imageUpload.uploading}
                    progress={imageUpload.progress}
                    error={imageUpload.error}
                    label="Subir imagen"
                    disabled={saving}
                  />
                  
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
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div>
                  <Label htmlFor="url">URL de la página *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="mi-pagina"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSlugFromTitle}
                      disabled={!formData.titulo}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    La URL aparecerá como: /paginas/{formData.url || 'mi-pagina'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={(checked) => handleInputChange('publicado', checked)}
                  />
                  <Label htmlFor="publicado">Publicar página</Label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/paginas')}
                disabled={saving || imageUpload.uploading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving || imageUpload.uploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Actualizar' : 'Crear'} Página
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