// src/pages/admin/ExamenForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examenService } from '../../services/examenService';
import { StorageService, STORAGE_BUCKETS } from '../../services/storageService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { FileUpload } from '../../components/ui/FileUpload';
import { SimpleHtmlEditor } from '../../components/ui/SimpleHtmlEditor';
import HorariosImprovedSection from '../../components/admin/HorariosImprovedSection';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar,
  HelpCircle,
  FileText,
  Users,
  Globe,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { 
  ExamenCompleto, 
  ExamenCompletoFormData,
  ExamenHorarioFormData,
  ExamenExtraFormData,
  ExamenFaqFormData,
  ExamenMuestraFormData
} from '../../types/examen';

export default function ExamenForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Estados del formulario
  const [formData, setFormData] = useState<ExamenCompletoFormData>({
    url: '',
    titulo: '',
    resumen: '',
    contenido: '',
    en_titulo: '',
    en_resumen: '',
    en_contenido: '',
    imagen: '',
    publicado: false,
    horarios: [],
    extras: [],
    faqs: [],
    muestras: []
  });

  useEffect(() => {
    if (isEditing && id) {
      loadExamen();
    }
  }, [id, isEditing]);

  // Función auxiliar para convertir datos de BD a formulario
  const convertToFormData = (examenData: ExamenCompleto): ExamenCompletoFormData => {
    return {
      url: examenData.url,
      titulo: examenData.titulo || '',
      resumen: examenData.resumen || '',
      contenido: examenData.contenido || '',
      en_titulo: examenData.en_titulo || '',
      en_resumen: examenData.en_resumen || '',
      en_contenido: examenData.en_contenido || '',
      imagen: examenData.imagen || '',
      publicado: examenData.publicado,
      horarios: (examenData.horarios || []).map(h => ({
        dia: h.dia || '',
        hora: h.hora || '',
        publicado: h.publicado
      })),
      extras: (examenData.extras || []).map(e => ({
        titulo: e.titulo || '',
        contenido: e.contenido || '',
        boton_texto: e.boton_texto || '',
        en_titulo: e.en_titulo || '',
        en_contenido: e.en_contenido || '',
        en_boton_texto: e.en_boton_texto || '',
        boton_enlace: e.boton_enlace || '',
        publicado: e.publicado
      })),
      faqs: (examenData.faqs || []).map(f => ({
        pregunta: f.pregunta || '',
        respuesta: f.respuesta || '',
        en_pregunta: f.en_pregunta || '',
        en_respuesta: f.en_respuesta || '',
        publicado: f.publicado
      })),
      muestras: (examenData.muestras || []).map(m => ({
        seccion: m.seccion || '',
        pregunta: m.pregunta || '',
        publicado: m.publicado
      }))
    };
  };

  const loadExamen = async () => {
    try {
      setLoading(true);
      const examenData = await examenService.getExamenCompleto(parseInt(id!));
      
      if (!examenData) {
        setError('Examen no encontrado');
        return;
      }

      setFormData(convertToFormData(examenData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando examen';
      setError(`Error cargando examen: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (formData.titulo) {
      const slug = examenService.generateSlug(formData.titulo);
      handleInputChange('url', slug);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const validation = StorageService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileName = StorageService.generateFileName(file.name, 'examen');
      const imageUrl = await StorageService.uploadFile(
        STORAGE_BUCKETS.EXAMENES,
        fileName,
        file
      );

      handleInputChange('imagen', imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo imagen';
      setError(`Error subiendo imagen: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (shouldNavigate: boolean = true) => {
    try {
      setSaving(true);
      setError(null);

      // Validaciones básicas
      if (!formData.url) {
        throw new Error('La URL es requerida');
      }

      if (!formData.titulo) {
        throw new Error('El título es requerido');
      }

      // DEBUG: Mostrar datos antes de enviar
      console.log('FormData antes de enviar:', {
        examen: {
          url: formData.url,
          titulo: formData.titulo,
          publicado: formData.publicado
        },
        horarios: formData.horarios?.length || 0,
        extras: formData.extras?.length || 0,
        faqs: formData.faqs?.length || 0,
        muestras: formData.muestras?.length || 0,
        horariosDetalle: formData.horarios
      });

      // Validar URL única
      const isUniqueUrl = await examenService.validateUniqueUrl(
        formData.url, 
        isEditing ? parseInt(id!) : undefined
      );

      if (!isUniqueUrl) {
        throw new Error('La URL ya está en uso por otro examen');
      }

      if (isEditing) {
        console.log('=== MODO EDICIÓN ===');
        console.log('ID del examen:', id);
        
        // USAR EL NUEVO MÉTODO updateExamenCompleto
        await examenService.updateExamenCompleto(parseInt(id!), formData);
        console.log('Examen completo actualizado exitosamente');
        
        // Mostrar mensaje de éxito
        if (shouldNavigate) {
          navigate('/admin/examenes');
        } else {
          // Mostrar feedback temporal de éxito sin navegar
          const successMessage = 'Examen actualizado exitosamente';
          setError(null);
          
          // Crear elemento temporal de éxito
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
          successDiv.textContent = successMessage;
          document.body.appendChild(successDiv);
          
          // Remover después de 3 segundos
          setTimeout(() => {
            document.body.removeChild(successDiv);
          }, 3000);
        }
        
      } else {
        console.log('=== MODO CREACIÓN ===');
        await examenService.createExamenCompleto(formData);
        console.log('Examen completo creado exitosamente');
        navigate('/admin/examenes');
      }

    } catch (err) {
      console.error('Error detallado:', {
        error: err,
        message: err instanceof Error ? err.message : 'Error desconocido',
        stack: err instanceof Error ? err.stack : undefined
      });
      const errorMessage = err instanceof Error ? err.message : 'Error guardando examen';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };


  // ===========================================
  // FUNCIONES PARA MANEJAR FAQS
  // ===========================================

  const addFaq = () => {
    const newFaq: ExamenFaqFormData = {
      pregunta: '',
      respuesta: '',
      en_pregunta: '',
      en_respuesta: '',
      publicado: true
    };
    handleInputChange('faqs', [...(formData.faqs || []), newFaq]);
  };

  const updateFaq = (index: number, field: string, value: any) => {
    const updatedFaqs = (formData.faqs || []).map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    handleInputChange('faqs', updatedFaqs);
  };

  const removeFaq = (index: number) => {
    const updatedFaqs = (formData.faqs || []).filter((_, i) => i !== index);
    handleInputChange('faqs', updatedFaqs);
  };

  // ===========================================
  // FUNCIONES PARA MANEJAR EXTRAS
  // ===========================================

  const addExtra = () => {
    const newExtra: ExamenExtraFormData = {
      titulo: '',
      contenido: '',
      boton_texto: '',
      en_titulo: '',
      en_contenido: '',
      en_boton_texto: '',
      boton_enlace: '',
      publicado: true
    };
    handleInputChange('extras', [...(formData.extras || []), newExtra]);
  };

  const updateExtra = (index: number, field: string, value: any) => {
    const updatedExtras = (formData.extras || []).map((extra, i) => 
      i === index ? { ...extra, [field]: value } : extra
    );
    handleInputChange('extras', updatedExtras);
  };

  const removeExtra = (index: number) => {
    const updatedExtras = (formData.extras || []).filter((_, i) => i !== index);
    handleInputChange('extras', updatedExtras);
  };

  // ===========================================
  // FUNCIONES PARA MANEJAR MUESTRAS
  // ===========================================

  const addMuestra = () => {
    const newMuestra: ExamenMuestraFormData = {
      seccion: '',
      pregunta: '',
      publicado: true
    };
    handleInputChange('muestras', [...(formData.muestras || []), newMuestra]);
  };

  const updateMuestra = (index: number, field: string, value: any) => {
    const updatedMuestras = (formData.muestras || []).map((muestra, i) => 
      i === index ? { ...muestra, [field]: value } : muestra
    );
    handleInputChange('muestras', updatedMuestras);
  };

  const removeMuestra = (index: number) => {
    const updatedMuestras = (formData.muestras || []).filter((_, i) => i !== index);
    handleInputChange('muestras', updatedMuestras);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando examen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/examenes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Examen' : 'Nuevo Examen'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Modifica la información del examen' : 'Crea un nuevo examen TOEIC con todas sus secciones'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {formData.publicado && formData.url && (
            <Button
              variant="outline"
              onClick={() => window.open(`/examenes/${formData.url}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          {/* Botones de guardado - Diferentes para editar vs crear */}
          {isEditing ? (
            <>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={saving || uploading}
                size="lg"
                variant="outline"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar y Continuar
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => handleSubmit(true)}
                disabled={saving || uploading}
                size="lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar y Salir
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleSubmit(true)}
              disabled={saving || uploading}
              size="lg"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Examen
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="horarios" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horarios ({(formData.horarios || []).length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQs ({(formData.faqs || []).length})
          </TabsTrigger>
          <TabsTrigger value="extras" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Extras ({(formData.extras || []).length})
          </TabsTrigger>
          <TabsTrigger value="muestras" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Muestras ({(formData.muestras || []).length})
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB GENERAL ===== */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="url">URL del Examen *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="ej: toeic-listening-reading"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSlug}
                      disabled={!formData.titulo}
                    >
                      Auto
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    URL amigable para el examen (solo letras, números y guiones)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.publicado}
                    onCheckedChange={(checked) => handleInputChange('publicado', checked)}
                  />
                  <Label>Publicado</Label>
                </div>
              </div>

              {/* Tabs de idioma */}
              <Tabs defaultValue="es" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="es">🇪🇸 Español</TabsTrigger>
                  <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                </TabsList>

                <TabsContent value="es" className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="ej: TOEIC Listening & Reading"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resumen">Resumen</Label>
                    <Textarea
                      id="resumen"
                      value={formData.resumen}
                      onChange={(e) => handleInputChange('resumen', e.target.value)}
                      placeholder="Breve descripción del examen..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contenido">Contenido</Label>
                    <SimpleHtmlEditor
                      label="Contenido"
                      content={formData.contenido}
                      onChange={(content) => handleInputChange('contenido', content)}
                      placeholder="Contenido detallado del examen..."
                    />
                  </div>

                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="en_titulo">Title</Label>
                    <Input
                      id="en_titulo"
                      value={formData.en_titulo}
                      onChange={(e) => handleInputChange('en_titulo', e.target.value)}
                      placeholder="e.g: TOEIC Listening & Reading"
                    />
                  </div>

                  <div>
                    <Label htmlFor="en_resumen">Summary</Label>
                    <Textarea
                      id="en_resumen"
                      value={formData.en_resumen}
                      onChange={(e) => handleInputChange('en_resumen', e.target.value)}
                      placeholder="Brief description of the exam..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="en_contenido">Content</Label>
                    <SimpleHtmlEditor
                      label="Content"
                      content={formData.en_contenido}
                      onChange={(content) => handleInputChange('en_contenido', content)}
                      placeholder="Detailed exam content..."
                    />
                  </div>

                </TabsContent>
              </Tabs>

              {/* Upload de imagen */}
              <div>
                <Label>Imagen del Examen</Label>
                <FileUpload
                  onFileSelect={handleImageUpload}
                  loading={uploading}
                  currentImage={formData.imagen}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB HORARIOS ===== */}
        <TabsContent value="horarios" className="space-y-6">
         <HorariosImprovedSection 
            formData={formData}
            onHorariosChange={(horarios) => handleInputChange('horarios', horarios)}
          />
        </TabsContent>

        {/* ===== TAB FAQS ===== */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preguntas Frecuentes</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Responde las dudas más comunes sobre este examen
                  </p>
                </div>
                <Button onClick={addFaq}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.faqs && formData.faqs.length > 0 ? (
                <div className="space-y-6">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">FAQ #{index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.publicado}
                            onCheckedChange={(checked) => updateFaq(index, 'publicado', checked)}
                          />
                          <Label className="text-sm">Publicado</Label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Tabs defaultValue="es-faq" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="es-faq">🇪🇸 Español</TabsTrigger>
                          <TabsTrigger value="en-faq">🇺🇸 English</TabsTrigger>
                        </TabsList>

                        <TabsContent value="es-faq" className="space-y-4">
                          <div>
                            <Label>Pregunta</Label>
                            <Input
                              value={faq.pregunta || ''}
                              onChange={(e) => updateFaq(index, 'pregunta', e.target.value)}
                              placeholder="¿Cuánto dura el examen?"
                            />
                          </div>
                          <div>
                            <Label>Respuesta</Label>
                            <SimpleHtmlEditor
                              content={faq.respuesta || ''}
                              onChange={(content) => updateFaq(index, 'respuesta', content)}
                              placeholder="El examen tiene una duración de..."
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="en-faq" className="space-y-4">
                          <div>
                            <Label>Question</Label>
                            <Input
                              value={faq.en_pregunta || ''}
                              onChange={(e) => updateFaq(index, 'en_pregunta', e.target.value)}
                              placeholder="How long is the exam?"
                            />
                          </div>
                          <div>
                            <Label>Answer</Label>
                            <SimpleHtmlEditor
                              content={faq.en_respuesta || ''}
                              onChange={(content) => updateFaq(index, 'en_respuesta', content)}
                              placeholder="The exam duration is..."
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay FAQs</h3>
                  <p className="text-gray-500 mb-4">Agrega preguntas frecuentes para ayudar a los usuarios</p>
                  <Button onClick={addFaq}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera FAQ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB EXTRAS ===== */}
        <TabsContent value="extras" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información Extra</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Contenido adicional como consejos, recursos o material complementario
                  </p>
                </div>
                <Button onClick={addExtra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Extra
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.extras && formData.extras.length > 0 ? (
                <div className="space-y-6">
                  {formData.extras.map((extra, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Extra #{index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={extra.publicado}
                            onCheckedChange={(checked) => updateExtra(index, 'publicado', checked)}
                          />
                          <Label className="text-sm">Publicado</Label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExtra(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Tabs defaultValue="es-extra" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="es-extra">🇪🇸 Español</TabsTrigger>
                          <TabsTrigger value="en-extra">🇺🇸 English</TabsTrigger>
                        </TabsList>

                        <TabsContent value="es-extra" className="space-y-4">
                          <div>
                            <Label>Título</Label>
                            <Input
                              value={extra.titulo || ''}
                              onChange={(e) => updateExtra(index, 'titulo', e.target.value)}
                              placeholder="ej: Consejos para el examen"
                            />
                          </div>
                          <div>
                            <Label>Contenido</Label>
                            <SimpleHtmlEditor
                              content={extra.contenido || ''}
                              onChange={(content) => updateExtra(index, 'contenido', content)}
                              placeholder="Información adicional..."
                            />
                          </div>
                          <div>
                            <Label>Texto del Botón</Label>
                            <Input
                              value={extra.boton_texto || ''}
                              onChange={(e) => updateExtra(index, 'boton_texto', e.target.value)}
                              placeholder="ej: Descargar Guía"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="en-extra" className="space-y-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={extra.en_titulo || ''}
                              onChange={(e) => updateExtra(index, 'en_titulo', e.target.value)}
                              placeholder="e.g: Exam Tips"
                            />
                          </div>
                          <div>
                            <Label>Content</Label>
                            <SimpleHtmlEditor
                              content={extra.en_contenido || ''}
                              onChange={(content) => updateExtra(index, 'en_contenido', content)}
                              placeholder="Additional information..."
                            />
                          </div>
                          <div>
                            <Label>Button Text</Label>
                            <Input
                              value={extra.en_boton_texto || ''}
                              onChange={(e) => updateExtra(index, 'en_boton_texto', e.target.value)}
                              placeholder="e.g: Download Guide"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="mt-4">
                        <Label>Enlace del Botón</Label>
                        <Input
                          value={extra.boton_enlace || ''}
                          onChange={(e) => updateExtra(index, 'boton_enlace', e.target.value)}
                          placeholder="https://ejemplo.com/recurso"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay información extra</h3>
                  <p className="text-gray-500 mb-4">Agrega contenido adicional como consejos o recursos</p>
                  <Button onClick={addExtra}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Extra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB MUESTRAS ===== */}
        <TabsContent value="muestras" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preguntas de Muestra</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Ejemplos de preguntas para que los usuarios practiquen
                  </p>
                </div>
                <Button onClick={addMuestra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Muestra
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.muestras && formData.muestras.length > 0 ? (
                <div className="space-y-6">
                  {formData.muestras.map((muestra, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Muestra #{index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={muestra.publicado}
                            onCheckedChange={(checked) => updateMuestra(index, 'publicado', checked)}
                          />
                          <Label className="text-sm">Publicado</Label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeMuestra(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Sección</Label>
                          <Input
                            value={muestra.seccion || ''}
                            onChange={(e) => updateMuestra(index, 'seccion', e.target.value)}
                            placeholder="ej: Listening, Reading, Grammar"
                          />
                        </div>

                        <div>
                          <Label>Pregunta de Muestra</Label>
                          <SimpleHtmlEditor
                            content={muestra.pregunta || ''}
                            onChange={(content) => updateMuestra(index, 'pregunta', content)}
                            placeholder="Escribe aquí la pregunta de ejemplo con sus opciones..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No hay muestras</h3>
                  <p className="text-gray-500 mb-4">Agrega preguntas de ejemplo para que los usuarios puedan practicar</p>
                  <Button onClick={addMuestra}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Muestra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botón flotante de guardar en mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => handleSubmit(true)}
          disabled={saving || uploading}
          size="lg"
          className="rounded-full shadow-lg h-14 w-14"
        >
          {saving ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay de guardado */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3 max-w-sm mx-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">
                {isEditing ? 'Actualizando examen...' : 'Creando examen...'}
              </p>
              <p className="text-sm text-gray-600">
                Esto puede tomar unos momentos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de upload */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3 max-w-sm mx-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">Subiendo imagen...</p>
              <p className="text-sm text-gray-600">
                Por favor espera
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de cambios no guardados */}
      {!saving && !uploading && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Cambios sin guardar
          </div>
        </div>
      )}
    </div>
  );
}