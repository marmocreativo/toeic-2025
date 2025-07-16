// src/pages/admin/AdminCentrosEstados.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Globe, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import type { CentroEstado, CentroEstadoForm } from '../../types/centro';
import {
  getCentrosEstados,
  createCentroEstado,
  updateCentroEstado,
  deleteCentroEstado,
  getEstadisticasCentros
} from '../../services/centroService';

export default function AdminCentrosEstados() {
  const [estados, setEstados] = useState<CentroEstado[]>([]);
  const [filteredEstados, setFilteredEstados] = useState<CentroEstado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEstado, setEditingEstado] = useState<CentroEstado | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [formData, setFormData] = useState<CentroEstadoForm>({
    clave: '',
    nombre: '',
    publicado: false
  });

  const loadEstados = async () => {
    try {
      setLoading(true);
      const data = await getCentrosEstados();
      setEstados(data);
      setFilteredEstados(data);
    } catch (err) {
      setError('Error al cargar los estados');
      console.error(err);
    } finally {
      setLoading(false);
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
    loadEstados();
    loadEstadisticas();
  }, []);

  useEffect(() => {
    const filtered = estados.filter(estado =>
      estado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.clave.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEstados(filtered);
  }, [searchTerm, estados]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEstado) {
        await updateCentroEstado(editingEstado.id, formData);
      } else {
        await createCentroEstado(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      loadEstados();
      loadEstadisticas();
    } catch (err) {
      setError(editingEstado ? 'Error al actualizar el estado' : 'Error al crear el estado');
      console.error(err);
    }
  };

  const handleEdit = (estado: CentroEstado) => {
    setEditingEstado(estado);
    setFormData({
      clave: estado.clave,
      nombre: estado.nombre,
      publicado: estado.publicado
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estado?')) {
      try {
        await deleteCentroEstado(id);
        loadEstados();
        loadEstadisticas();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el estado');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clave: '',
      nombre: '',
      publicado: false
    });
    setEditingEstado(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando estados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Estados</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Estado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clave">Clave *</Label>
                <Input
                  id="clave"
                  value={formData.clave}
                  onChange={(e) => setFormData(prev => ({ ...prev, clave: e.target.value }))}
                  placeholder="Ej: CDMX, JAL, NL"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Ciudad de México, Jalisco, Nuevo León"
                  required
                />
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
                  {editingEstado ? 'Actualizar' : 'Crear'}
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
              <CardTitle className="text-sm font-medium">Estados</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.estados.total}</div>
              <div className="text-xs text-muted-foreground">
                {estadisticas.estados.publicados} publicados, {estadisticas.estados.borradores} borradores
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Centros</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.centros.total}</div>
              <div className="text-xs text-muted-foreground">
                {estadisticas.centros.publicados} publicados, {estadisticas.centros.borradores} borradores
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
            placeholder="Buscar estados..."
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

      {/* Lista de estados */}
      <div className="grid gap-4">
        {filteredEstados.map((estado) => (
          <Card key={estado.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-lg">{estado.nombre}</h3>
                    <p className="text-sm text-gray-600">Clave: {estado.clave}</p>
                  </div>
                  <Badge variant={estado.publicado ? "default" : "secondary"}>
                    {estado.publicado ? 'Publicado' : 'Borrador'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(estado)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(estado.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEstados.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No se encontraron estados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}