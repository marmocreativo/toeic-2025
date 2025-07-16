// src/pages/admin/AdminNewsletters.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Download, Calendar, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import FileUpload from '../../components/ui/FileUpload';
import type { Newsletter, NewsletterForm } from '../../types/newsletter';
import {
  getNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getEstadisticasNewsletters
} from '../../services/newsletterService';

export default function AdminNewsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [formData, setFormData] = useState<NewsletterForm>({
    titulo: '',
    descripcion: '',
    fecha_publicacion: new Date().toISOString().split('T')[0], // Fecha actual
    archivo: '',
    publicado: false
  });

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const data = await getNewsletters();
      setNewsletters(data);
      setFilteredNewsletters(data);
    } catch (err) {
      setError('Error al cargar los newsletters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await getEstadisticasNewsletters();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  useEffect(() => {
    loadNewsletters();
    loadEstadisticas();
  }, []);

  useEffect(() => {
    const filtered = newsletters.filter(newsletter =>
      newsletter.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNewsletters(filtered);
  }, [searchTerm, newsletters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.archivo) {
      setError('Debes subir un archivo PDF');
      return;
    }

    try {
      if (editingNewsletter) {
        await updateNewsletter(editingNewsletter.id, formData);
      } else {
        await createNewsletter(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      loadNewsletters();
      loadEstadisticas();
      setError(null);
    } catch (err) {
      setError(editingNewsletter ? 'Error al actualizar el newsletter' : 'Error al crear el newsletter');
      console.error(err);
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      titulo: newsletter.titulo,
      descripcion: newsletter.descripcion,
      fecha_publicacion: newsletter.fecha_publicacion,
      archivo: newsletter.archivo,
      publicado: newsletter.publicado
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este newsletter? El archivo PDF también será eliminado.')) {
      try {
        await deleteNewsletter(id);
        loadNewsletters();
        loadEstadisticas();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el newsletter');
        console.error(err);
      }
    }
  };

  const handleFileUpload = (url: string) => {
    setFormData(prev => ({ ...prev, archivo: url }));
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_publicacion: new Date().toISOString().split('T')[0],
      archivo: '',
      publicado: false
    });
    setEditingNewsletter(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || 'archivo.pdf';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando newsletters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Newsletters</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNewsletter ? 'Editar Newsletter' : 'Nuevo Newsletter'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título del newsletter"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción breve del contenido"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Publicación *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_publicacion: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Archivo PDF *</Label>
                <FileUpload
                  bucket="general"
                  onUpload={handleFileUpload}
                  currentFile={formData.archivo}
                  acceptedTypes={['application/pdf']}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
                {formData.archivo && (
                  <div className="text-sm text-green-600 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {getFileNameFromUrl(formData.archivo)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="publicado"
                  checked={formData.publicado}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicado: checked }))}
                />
                <Label htmlFor="publicado">Publicado</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingNewsletter ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.publicados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estadisticas.borradores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recientes</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.recientes}</div>
              <div className="text-xs text-muted-foreground">Últimos 6 meses</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar newsletters por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de newsletters */}
      <div className="grid gap-4">
        {filteredNewsletters.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg">{newsletter.titulo}</h3>
                    <Badge variant={newsletter.publicado ? "default" : "secondary"}>
                      {newsletter.publicado ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </div>
                  
                  {newsletter.descripcion && (
                    <p className="text-gray-600 mb-3">{newsletter.descripcion}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(newsletter.fecha_publicacion)}</span>
                    </div>
                    
                    {newsletter.archivo && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{getFileNameFromUrl(newsletter.archivo)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {newsletter.archivo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(newsletter.archivo, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(newsletter)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(newsletter.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNewsletters.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron newsletters que coincidan con tu búsqueda.' : 'No hay newsletters registrados aún.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleOpenDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer newsletter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}