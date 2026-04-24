// src/pages/admin/AdminFechasAplicaciones.tsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, Building2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import type { FechaAplicacion, FechaAplicacionFormData, TipoRecurrencia } from '../../types/fechaAplicacion';
import type { CentroConEstado } from '../../types/centro';
import {
  getFechasAplicaciones,
  createFechaAplicacion,
  updateFechaAplicacion,
  deleteFechaAplicacion,
  togglePublicadoFecha,
  describeFechaAplicacion,
} from '../../services/fechaAplicacionService';
import { getCentros } from '../../services/centroService';

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const TIPO_RECURRENCIA_LABELS: Record<string, string> = {
  dia_mes: 'Día del mes',
  ultimo_dia_semana: 'Último día de la semana',
  primer_dia_semana: 'Primer día de la semana',
};

const emptyForm: FechaAplicacionFormData = {
  id_centro: null,
  fecha: undefined,
  tipo_recurrencia: undefined,
  dia_mes: undefined,
  dia_semana: undefined,
  hora: undefined,
  notas: undefined,
  publicado: false,
  orden: 0,
};

export default function AdminFechasAplicaciones() {
  const [fechas, setFechas] = useState<FechaAplicacion[]>([]);
  const [centros, setCentros] = useState<CentroConEstado[]>([]);
  const [filteredFechas, setFilteredFechas] = useState<FechaAplicacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCentro, setFilterCentro] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFecha, setEditingFecha] = useState<FechaAplicacion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FechaAplicacionFormData>(emptyForm);
  const [modoRecurrente, setModoRecurrente] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fechasData, centrosData] = await Promise.all([
        getFechasAplicaciones(),
        getCentros(),
      ]);
      setFechas(fechasData);
      setCentros(centrosData.filter(c => c.publicado));
      setFilteredFechas(fechasData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = fechas;

    if (filterCentro === 'general') {
      filtered = filtered.filter(f => f.id_centro === null);
    } else if (filterCentro !== 'all') {
      filtered = filtered.filter(f => f.id_centro === Number(filterCentro));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.centro?.nombre?.toLowerCase().includes(term) ||
        f.notas?.toLowerCase().includes(term) ||
        describeFechaAplicacion(f).toLowerCase().includes(term)
      );
    }

    setFilteredFechas(filtered);
  }, [searchTerm, filterCentro, fechas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!modoRecurrente && !formData.fecha) {
      setError('Debes ingresar una fecha');
      return;
    }
    if (modoRecurrente && !formData.tipo_recurrencia) {
      setError('Debes seleccionar un tipo de recurrencia');
      return;
    }
    if (modoRecurrente && formData.tipo_recurrencia === 'dia_mes' && !formData.dia_mes) {
      setError('Debes ingresar el día del mes');
      return;
    }
    if (modoRecurrente && formData.tipo_recurrencia !== 'dia_mes' && formData.dia_semana === undefined) {
      setError('Debes seleccionar el día de la semana');
      return;
    }

    try {
      const payload: FechaAplicacionFormData = {
        ...formData,
        fecha: modoRecurrente ? undefined : formData.fecha,
        tipo_recurrencia: modoRecurrente ? formData.tipo_recurrencia : undefined,
        dia_mes: modoRecurrente && formData.tipo_recurrencia === 'dia_mes' ? formData.dia_mes : undefined,
        dia_semana: modoRecurrente && formData.tipo_recurrencia !== 'dia_mes' ? formData.dia_semana : undefined,
      };

      if (editingFecha) {
        await updateFechaAplicacion(editingFecha.id, payload);
      } else {
        await createFechaAplicacion(payload);
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(editingFecha ? 'Error al actualizar la fecha' : 'Error al crear la fecha');
      console.error(err);
    }
  };

  const handleEdit = (fecha: FechaAplicacion) => {
    setEditingFecha(fecha);
    const esRecurrente = !!fecha.tipo_recurrencia;
    setModoRecurrente(esRecurrente);
    setFormData({
      id_centro: fecha.id_centro,
      fecha: fecha.fecha ?? undefined,
      tipo_recurrencia: (fecha.tipo_recurrencia as TipoRecurrencia) ?? undefined,
      dia_mes: fecha.dia_mes ?? undefined,
      dia_semana: fecha.dia_semana ?? undefined,
      hora: fecha.hora ?? undefined,
      notas: fecha.notas ?? undefined,
      publicado: fecha.publicado,
      orden: fecha.orden,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta fecha?')) {
      try {
        await deleteFechaAplicacion(id);
        loadData();
      } catch (err) {
        setError('Error al eliminar la fecha');
        console.error(err);
      }
    }
  };

  const handleTogglePublicado = async (fecha: FechaAplicacion) => {
    try {
      await togglePublicadoFecha(fecha.id, !fecha.publicado);
      loadData();
    } catch (err) {
      setError('Error al cambiar el estado de la fecha');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingFecha(null);
    setModoRecurrente(false);
    setError(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const totalPublicadas = fechas.filter(f => f.publicado).length;
  const totalRecurrentes = fechas.filter(f => !!f.tipo_recurrencia).length;
  const totalEspecificas = fechas.filter(f => !!f.fecha).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-text-muted">Cargando fechas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-primary mb-2">Fechas de Aplicación</h1>
          <p className="text-secondary">Administra las fechas de examen por centro autorizado</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Fecha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-medium text-primary">
                {editingFecha ? 'Editar Fecha' : 'Nueva Fecha de Aplicación'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Centro */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text">Centro</Label>
                <Select
                  value={formData.id_centro === null ? 'general' : formData.id_centro ? String(formData.id_centro) : ''}
                  onValueChange={(val) => setFormData(prev => ({
                    ...prev,
                    id_centro: val === 'general' ? null : Number(val),
                  }))}
                >
                  <SelectTrigger className="border-border focus:border-primary">
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      🌐 Todos los centros (general)
                    </SelectItem>
                    {centros.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre} — {c.estado?.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecciona un centro específico o déjalo en "Todos" para que aplique de forma general.
                </p>
              </div>

              {/* Toggle modo */}
              <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border border-border">
                <Calendar className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text flex-1">
                  {modoRecurrente ? 'Fecha recurrente' : 'Fecha específica'}
                </span>
                <Switch
                  checked={modoRecurrente}
                  onCheckedChange={(val) => {
                    setModoRecurrente(val);
                    setFormData(prev => ({
                      ...prev,
                      fecha: undefined,
                      tipo_recurrencia: undefined,
                      dia_mes: undefined,
                      dia_semana: undefined,
                    }));
                  }}
                />
                <RefreshCw className="w-4 h-4 text-text-muted" />
              </div>

              {/* Fecha específica */}
              {!modoRecurrente && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text">Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="border-border focus:border-primary"
                  />
                </div>
              )}

              {/* Recurrencia */}
              {modoRecurrente && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text">Tipo de recurrencia *</Label>
                    <Select
                      value={formData.tipo_recurrencia || ''}
                      onValueChange={(val) => setFormData(prev => ({
                        ...prev,
                        tipo_recurrencia: val as TipoRecurrencia,
                        dia_mes: undefined,
                        dia_semana: undefined,
                      }))}
                    >
                      <SelectTrigger className="border-border focus:border-primary">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPO_RECURRENCIA_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo_recurrencia === 'dia_mes' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-text">Día del mes (1-31) *</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={formData.dia_mes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dia_mes: Number(e.target.value) }))}
                        placeholder="Ej: 15"
                        className="border-border focus:border-primary"
                      />
                      {formData.dia_mes && (
                        <p className="text-xs text-muted-foreground">
                          Se aplicará todos los días {formData.dia_mes} de cada mes.
                        </p>
                      )}
                    </div>
                  )}

                  {(formData.tipo_recurrencia === 'ultimo_dia_semana' || formData.tipo_recurrencia === 'primer_dia_semana') && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-text">Día de la semana *</Label>
                      <Select
                        value={formData.dia_semana !== undefined ? String(formData.dia_semana) : ''}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, dia_semana: Number(val) }))}
                      >
                        <SelectTrigger className="border-border focus:border-primary">
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA.map(d => (
                            <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.tipo_recurrencia && formData.dia_semana !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Se aplicará el {formData.tipo_recurrencia === 'ultimo_dia_semana' ? 'último' : 'primer'}{' '}
                          {DIAS_SEMANA.find(d => d.value === formData.dia_semana)?.label.toLowerCase()} de cada mes.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hora */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text">Hora (opcional)</Label>
                <Input
                  type="time"
                  value={formData.hora || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  className="border-border focus:border-primary"
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text">Notas (opcional)</Label>
                <Textarea
                  value={formData.notas || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                  placeholder="Información adicional sobre esta fecha..."
                  className="border-border focus:border-primary resize-none"
                  rows={2}
                />
              </div>

              {/* Publicado */}
              <div className="flex items-center space-x-3 p-4 bg-bg rounded-lg border border-border">
                <Switch
                  checked={formData.publicado}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicado: checked }))}
                />
                <Label className="text-sm font-medium text-text cursor-pointer">Publicado</Label>
                <span className="text-sm text-text-muted">
                  {formData.publicado ? 'Visible para usuarios' : 'Solo visible para administradores'}
                </span>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border hover:bg-bg"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {editingFecha ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Total Fechas</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{fechas.length}</div>
            <div className="text-sm text-text-muted">
              <span className="text-primary font-medium">{totalPublicadas}</span> publicadas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Fechas Específicas</CardTitle>
            <div className="p-2 bg-secondary/10 rounded-full">
              <Calendar className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary mb-1">{totalEspecificas}</div>
            <div className="text-sm text-text-muted">fechas puntuales</div>
          </CardContent>
        </Card>

        <Card className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Recurrentes</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{totalRecurrentes}</div>
            <div className="text-sm text-text-muted">reglas activas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-bg-light rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Buscar por centro, notas o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border focus:border-primary"
              />
            </div>
            <Select value={filterCentro} onValueChange={setFilterCentro}>
              <SelectTrigger className="w-full sm:w-64 border-border focus:border-primary">
                <SelectValue placeholder="Filtrar por centro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="general">🌐 Generales (sin centro)</SelectItem>
                {centros.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de error */}
      {error && !isDialogOpen && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {filteredFechas.map((fecha) => (
          <Card key={fecha.id} className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-full flex-shrink-0 ${fecha.tipo_recurrencia ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                    {fecha.tipo_recurrencia
                      ? <RefreshCw className="w-5 h-5 text-secondary" />
                      : <Calendar className="w-5 h-5 text-primary" />
                    }
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="font-semibold text-primary truncate">
                        {fecha.centro?.nombre ?? '🌐 Todos los centros'}
                      </span>
                      <Badge
                        variant={fecha.publicado ? 'default' : 'secondary'}
                        className={fecha.publicado ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}
                      >
                        {fecha.publicado ? 'Publicado' : 'Borrador'}
                      </Badge>
                      <Badge variant="outline" className={fecha.tipo_recurrencia ? 'border-secondary text-secondary' : 'border-primary text-primary'}>
                        {fecha.tipo_recurrencia ? 'Recurrente' : 'Específica'}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-text">
                      {describeFechaAplicacion(fecha)}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      {fecha.hora && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{fecha.hora}</span>
                        </div>
                      )}
                      {fecha.notas && (
                        <span className="italic truncate max-w-xs">{fecha.notas}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublicado(fecha)}
                    className="border-border hover:bg-primary/10 hover:border-primary/30"
                    title={fecha.publicado ? 'Despublicar' : 'Publicar'}
                  >
                    {fecha.publicado
                      ? <ToggleRight className="w-4 h-4 text-primary" />
                      : <ToggleLeft className="w-4 h-4 text-text-muted" />
                    }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(fecha)}
                    className="border-border hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(fecha.id)}
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
      {filteredFechas.length === 0 && !loading && (
        <Card className="bg-bg-light rounded-lg border border-border">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-text">
                  {searchTerm || filterCentro !== 'all' ? 'No se encontraron fechas' : 'No hay fechas registradas'}
                </h3>
                <p className="text-text-muted">
                  {searchTerm || filterCentro !== 'all'
                    ? 'Intenta modificar los filtros de búsqueda.'
                    : 'Comienza agregando la primera fecha de aplicación.'
                  }
                </p>
              </div>
              {!searchTerm && filterCentro === 'all' && (
                <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primera fecha
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}