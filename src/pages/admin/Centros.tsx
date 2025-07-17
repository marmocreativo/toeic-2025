// src/pages/admin/AdminCentros.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Phone, Mail, Building2,  Image, Eye } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import ImportarCentrosCSV from '../../components/admin/ImportarCentrosCSV';
import type { CentroConEstado, CentroForm, CentroEstado } from '../../types/centro';
import {
  getCentros,
  createCentro,
  updateCentro,
  deleteCentro,
  getCentrosEstados,
  getEstadisticasCentros,
  publicarTodosCentros
} from '../../services/centroService';

export default function AdminCentros() {
  const [centros, setCentros] = useState<CentroConEstado[]>([]);
  const [estados, setEstados] = useState<CentroEstado[]>([]);
  const [filteredCentros, setFilteredCentros] = useState<CentroConEstado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCentro, setEditingCentro] = useState<CentroConEstado | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [publishingAll, setPublishingAll] = useState(false);

  const [formData, setFormData] = useState<CentroForm>({
    clave: '',
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    imagen: '',
    publicado: false
  });

  const loadCentros = async () => {
    try {
      setLoading(true);
      const data = await getCentros();
      setCentros(data);
      setFilteredCentros(data);
    } catch (err) {
      setError('Error al cargar los centros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEstados = async () => {
    try {
      const data = await getCentrosEstados();
      setEstados(data.filter(estado => estado.publicado));
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await getEstadisticasCentros();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  useEffect(() => {
    loadCentros();
    loadEstados();
    loadEstadisticas();
  }, []);

  useEffect(() => {
    const filtered = centros.filter(centro =>
      centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.telefono.includes(searchTerm) ||
      centro.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.estado?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCentros(filtered);
  }, [searchTerm, centros]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCentro) {
        await updateCentro(editingCentro.id, formData);
      } else {
        await createCentro(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      loadCentros();
      loadEstadisticas();
    } catch (err) {
      setError(editingCentro ? 'Error al actualizar el centro' : 'Error al crear el centro');
      console.error(err);
    }
  };

  const handleEdit = (centro: CentroConEstado) => {
    setEditingCentro(centro);
    setFormData({
      clave: centro.clave,
      nombre: centro.nombre,
      direccion: centro.direccion,
      telefono: centro.telefono,
      correo: centro.correo,
      imagen: centro.imagen || '',
      publicado: centro.publicado
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
      try {
        await deleteCentro(id);
        loadCentros();
        loadEstadisticas();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el centro');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clave: '',
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      imagen: '',
      publicado: false
    });
    setEditingCentro(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleImportComplete = () => {
    loadCentros();
    loadEstadisticas();
    setError(null);
  };

  const handlePublishAll = async () => {
    const centrosBorrador = centros.filter(centro => !centro.publicado);
    
    if (centrosBorrador.length === 0) {
      setError('No hay centros en borrador para publicar');
      return;
    }

    const confirmMessage = `¿Estás seguro de que deseas publicar ${centrosBorrador.length} centro(s) en borrador?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setPublishingAll(true);
        await publicarTodosCentros();
        loadCentros();
        loadEstadisticas();
        setError(null);
      } catch (err) {
        setError('Error al publicar los centros');
        console.error(err);
      } finally {
        setPublishingAll(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-text-muted">Cargando centros...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-primary mb-2">Gestión de Centros</h1>
          <p className="text-secondary">Administra los centros de examen TOEIC</p>
        </div>
        <div className="flex items-center space-x-3">
          <ImportarCentrosCSV onImportComplete={handleImportComplete} />
          
          {/* Botón para publicar todos */}
          {estadisticas && estadisticas.centros.borradores > 0 && (
            <Button 
              onClick={handlePublishAll}
              disabled={publishingAll}
              variant="outline"
              className="border-secondary hover:bg-secondary/10 hover:border-secondary/30"
            >
              {publishingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary mr-2"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publicar Todos ({estadisticas.centros.borradores})
                </>
              )}
            </Button>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Centro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium text-primary">
                  {editingCentro ? 'Editar Centro' : 'Nuevo Centro'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-sm font-medium text-text">Estado *</Label>
                    <Select
                      value={formData.clave}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, clave: value }))}
                    >
                      <SelectTrigger className="border-border focus:border-primary">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.clave} value={estado.clave}>
                            {estado.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-text">Nombre del Centro *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Centro TOEIC Ciudad de México"
                      className="border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-sm font-medium text-text">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Dirección completa del centro"
                    className="border-border focus:border-primary resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-text">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ej: +52 55 1234 5678"
                      className="border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo" className="text-sm font-medium text-text">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                      placeholder="contacto@centro.com"
                      className="border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagen" className="text-sm font-medium text-text">Imagen del Centro</Label>
                  <Input
                    id="imagen"
                    value={formData.imagen}
                    onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
                    placeholder="Ej: centro-cdmx-norte.jpg o ruta completa"
                    className="border-border focus:border-primary"
                  />
                  <p className="text-xs text-text-muted">
                    Puedes ingresar solo el nombre del archivo (debe estar en /public/images/centros/) o la ruta completa
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-bg rounded-lg border border-border">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicado: checked }))}
                  />
                  <Label htmlFor="publicado" className="text-sm font-medium text-text cursor-pointer">
                    Publicado
                  </Label>
                  <span className="text-sm text-text-muted">
                    {formData.publicado ? 'Visible para usuarios' : 'Solo visible para administradores'}
                  </span>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-border hover:bg-bg"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {editingCentro ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-text-muted">Total Centros</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{estadisticas.centros.total}</div>
              <div className="text-sm text-text-muted">
                <span className="text-primary font-medium">{estadisticas.centros.publicados}</span> publicados, {' '}
                <span className="text-secondary font-medium">{estadisticas.centros.borradores}</span> borradores
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-text-muted">Estados Activos</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-full">
                <MapPin className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-1">{estadisticas.estados.publicados}</div>
              <div className="text-sm text-text-muted">
                de <span className="text-secondary font-medium">{estadisticas.estados.total}</span> estados totales
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <Card className="bg-bg-light rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar centros por nombre, dirección, teléfono, correo o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de centros */}
      <div className="space-y-4">
        {filteredCentros.map((centro) => (
          <Card key={centro.id} className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="font-semibold text-xl text-primary truncate">{centro.nombre}</h3>
                    <Badge 
                      variant={centro.publicado ? "default" : "secondary"}
                      className={centro.publicado ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}
                    >
                      {centro.publicado ? 'Publicado' : 'Borrador'}
                    </Badge>
                    {centro.estado && (
                      <Badge variant="outline" className="border-secondary text-secondary">
                        {centro.estado.nombre}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {centro.direccion && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-muted" />
                        <span className="text-sm text-text-muted leading-relaxed">{centro.direccion}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-6">
                      {centro.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-muted">{centro.telefono}</span>
                        </div>
                      )}
                      
                      {centro.correo && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-muted">{centro.correo}</span>
                        </div>
                      )}

                      {centro.imagen && (
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-muted">
                            {centro.imagen.includes('/') ? centro.imagen.split('/').pop() : centro.imagen}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(centro)}
                    className="border-border hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(centro.id)}
                    className="border-border hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredCentros.length === 0 && !loading && (
        <Card className="bg-bg-light rounded-lg border border-border">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-text">
                  {searchTerm ? 'No se encontraron centros' : 'No hay centros registrados'}
                </h3>
                <p className="text-text-muted">
                  {searchTerm 
                    ? 'Intenta modificar los términos de búsqueda o crear un nuevo centro.' 
                    : 'Comienza agregando tu primer centro de examen TOEIC.'
                  }
                </p>
              </div>
              {!searchTerm && (
                <div className="flex justify-center space-x-3">
                  <ImportarCentrosCSV onImportComplete={handleImportComplete} />
                  <Button 
                    onClick={handleOpenDialog}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar primer centro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}