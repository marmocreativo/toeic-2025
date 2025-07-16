// src/pages/admin/AdminCentros.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Phone, Mail, Globe } from 'lucide-react';
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
import type { CentroConEstado, CentroForm, CentroEstado } from '../../types/centro';
import {
  getCentros,
  createCentro,
  updateCentro,
  deleteCentro,
  getCentrosEstados,
  getEstadisticasCentros
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

  const [formData, setFormData] = useState<CentroForm>({
    clave: '',
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
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
      publicado: false
    });
    setEditingCentro(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando centros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Centros</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Centro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCentro ? 'Editar Centro' : 'Nuevo Centro'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.clave}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clave: value }))}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="nombre">Nombre del Centro *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Centro TOEIC Ciudad de México"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección completa del centro"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="Ej: +52 55 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="contacto@centro.com"
                  />
                </div>
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
                  {editingCentro ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.centros.total}</div>
              <div className="text-xs text-muted-foreground">
                {estadisticas.centros.publicados} publicados, {estadisticas.centros.borradores} borradores
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estados Activos</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.estados.publicados}</div>
              <div className="text-xs text-muted-foreground">
                de {estadisticas.estados.total} estados totales
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar centros por nombre, dirección, teléfono, correo o estado..."
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

      {/* Lista de centros */}
      <div className="grid gap-4">
        {filteredCentros.map((centro) => (
          <Card key={centro.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg">{centro.nombre}</h3>
                    <Badge variant={centro.publicado ? "default" : "secondary"}>
                      {centro.publicado ? 'Publicado' : 'Borrador'}
                    </Badge>
                    {centro.estado && (
                      <Badge variant="outline">{centro.estado.nombre}</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {centro.direccion && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{centro.direccion}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4">
                      {centro.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{centro.telefono}</span>
                        </div>
                      )}
                      
                      {centro.correo && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{centro.correo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(centro)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(centro.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCentros.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron centros que coincidan con tu búsqueda.' : 'No hay centros registrados aún.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleOpenDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer centro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}