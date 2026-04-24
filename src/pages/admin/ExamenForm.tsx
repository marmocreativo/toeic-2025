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
import { LexicalEditor } from '../../components/ui/LexicalEditor';

// Componentes separados
import HorariosImprovedSection from '../../components/admin/HorariosImprovedSection';
import FechasEspecialesSection from '../../components/admin/FechasEspecialesSection';
import ExtrasSection from '../../components/admin/ExtrasSection';
import FaqsSection from '../../components/admin/FaqsSection';
import MuestrasSection from '../../components/admin/MuestrasSection';

import { 
  Save, 
  ArrowLeft, 
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
  ExamenCompletoFormData
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
    texto_fechas_especiales: '',
    requisitos: '', // ← NUEVA LÍNEA
    en_requisitos: '', // ← NUEVA LÍNEA
    publicado: false,
    horarios: [],
    fechas_especiales: [],
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
      texto_fechas_especiales: examenData.texto_fechas_especiales || '',
      requisitos: examenData.requisitos || '',
      en_requisitos: examenData.en_requisitos || '',
      publicado: examenData.publicado,
      horarios: (examenData.horarios || []).map(h => ({
        dia: h.dia || '',
        hora: h.hora || '',
        publicado: h.publicado
      })),
      fechas_especiales: (examenData.fechas_especiales || []).map(f => ({
        fecha: f.fecha || '',
        hora: f.hora || '', // Si es null, se convierte a cadena vacía para el formulario
        publicado: f.publicado
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

      // Validar URL única
      const isUniqueUrl = await examenService.validateUniqueUrl(
        formData.url, 
        isEditing ? parseInt(id!) : undefined
      );

      if (!isUniqueUrl) {
        throw new Error('La URL ya está en uso por otro examen');
      }

      if (isEditing) {
        await examenService.updateExamenCompleto(parseInt(id!), formData);
        
        if (shouldNavigate) {
          navigate('/admin/examenes');
        } else {
          // Mostrar feedback temporal de éxito sin navegar
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
          successDiv.textContent = 'Examen actualizado exitosamente';
          document.body.appendChild(successDiv);
          
          setTimeout(() => {
            if (document.body.contains(successDiv)) {
              document.body.removeChild(successDiv);
            }
          }, 3000);
        }
      } else {
        await examenService.createExamenCompleto(formData);
        navigate('/admin/examenes');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando examen';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
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
              {isEditing ? 'Modifica la información del examen' : 'Crea un nuevo examen TOEIC® con todas sus secciones'}
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="horarios" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horarios ({(formData.horarios || []).length})
          </TabsTrigger>
          <TabsTrigger value="fechas-especiales" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fechas Esp. ({(formData.fechas_especiales || []).length})
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

        {/* TAB GENERAL */}
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
                      placeholder="ej: TOEIC® Listening & Reading"
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
                    <LexicalEditor
                      content={formData.contenido}
                      onChange={(content) => handleInputChange('contenido', content)}
                      placeholder=""
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requisitos">Requisitos</Label>
                    <LexicalEditor
                      content={formData.requisitos}
                      onChange={(content) => handleInputChange('requisitos', content)}
                      placeholder="Requisitos para tomar el examen..."
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
                      placeholder="e.g: TOEIC®Listening & Reading"
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
                    <LexicalEditor
                      content={formData.en_contenido}
                      onChange={(content) => handleInputChange('en_contenido', content)}
                      placeholder="Detailed exam content..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="en_requisitos">Requirements</Label>
                    <LexicalEditor
                      content={formData.en_requisitos}
                      onChange={(content) => handleInputChange('en_requisitos', content)}
                      placeholder="Requirements to take the exam..."
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

              {/* Texto de fechas especiales */}
              <div>
                <Label htmlFor="texto_fechas_especiales">Texto para Fechas Especiales</Label>
                <Input
                  id="texto_fechas_especiales"
                  value={formData.texto_fechas_especiales}
                  onChange={(e) => handleInputChange('texto_fechas_especiales', e.target.value)}
                  placeholder="ej: Fechas especiales del examen TOEIC® 2025"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Texto explicativo que aparecerá antes de las fechas especiales
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB HORARIOS */}
        <TabsContent value="horarios" className="space-y-6">
          <HorariosImprovedSection 
            formData={formData}
            onHorariosChange={(horarios) => handleInputChange('horarios', horarios)}
          />
        </TabsContent>

        {/* TAB FECHAS ESPECIALES */}
        <TabsContent value="fechas-especiales" className="space-y-6">
          <FechasEspecialesSection 
            fechasEspeciales={formData.fechas_especiales || []}
            onChange={(fechas) => handleInputChange('fechas_especiales', fechas)}
          />
        </TabsContent>

        {/* TAB FAQS */}
        <TabsContent value="faqs" className="space-y-6">
          <FaqsSection 
            faqs={formData.faqs || []}
            onChange={(faqs) => handleInputChange('faqs', faqs)}
          />
        </TabsContent>

        {/* TAB EXTRAS */}
        <TabsContent value="extras" className="space-y-6">
          <ExtrasSection 
            extras={formData.extras || []}
            onChange={(extras) => handleInputChange('extras', extras)}
          />
        </TabsContent>

        {/* TAB MUESTRAS */}
        <TabsContent value="muestras" className="space-y-6">
          <MuestrasSection 
            muestras={formData.muestras || []}
            onChange={(muestras) => handleInputChange('muestras', muestras)}
          />
        </TabsContent>
      </Tabs>

      {/* Botón flotante para móvil */}
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

      {/* Overlay de subida */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3 max-w-sm mx-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">Subiendo imagen...</p>
              <p className="text-sm text-gray-600">Por favor espera</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de cambios sin guardar */}
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