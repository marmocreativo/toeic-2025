// src/pages/admin/AdminCentrosEstados.tsx
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Globe, FileText, AlertCircle, MapPin, Upload, Download, X } from 'lucide-react';
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

// Interfaz para los datos del CSV
interface EstadoCSV {
  ESTADO_CLAVE: string;
  ESTADO_NOMBRE: string;
}

// Interfaz para el resultado de la importación
interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data: EstadoCSV }>;
  total: number;
}

export default function AdminCentrosEstados() {
  const [estados, setEstados] = useState<CentroEstado[]>([]);
  const [filteredEstados, setFilteredEstados] = useState<CentroEstado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEstado, setEditingEstado] = useState<CentroEstado | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Función para parsear CSV
  const parseCSV = (csvText: string): EstadoCSV[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Verificar que las columnas requeridas existan
    if (!headers.includes('ESTADO_CLAVE') || !headers.includes('ESTADO_NOMBRE')) {
      throw new Error('El CSV debe contener las columnas ESTADO_CLAVE y ESTADO_NOMBRE');
    }

    const claveIndex = headers.indexOf('ESTADO_CLAVE');
    const nombreIndex = headers.indexOf('ESTADO_NOMBRE');

    const data: EstadoCSV[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;

      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length >= Math.max(claveIndex + 1, nombreIndex + 1)) {
        data.push({
          ESTADO_CLAVE: columns[claveIndex] || '',
          ESTADO_NOMBRE: columns[nombreIndex] || ''
        });
      }
    }

    return data;
  };

  // Función para importar estados desde CSV
  const handleCSVImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);

    try {
      const csvText = await file.text();
      const estadosData = parseCSV(csvText);
      
      const result: ImportResult = {
        success: 0,
        errors: [],
        total: estadosData.length
      };

      // Procesar cada estado
      for (let i = 0; i < estadosData.length; i++) {
        const estadoData = estadosData[i];
        
        try {
          // Validar datos
          if (!estadoData.ESTADO_CLAVE || !estadoData.ESTADO_NOMBRE) {
            result.errors.push({
              row: i + 2, // +2 porque empezamos en fila 1 (header) + índice base 0
              error: 'Clave o nombre vacío',
              data: estadoData
            });
            continue;
          }

          // Verificar si ya existe
          const existeEstado = estados.find(e => 
            e.clave.toLowerCase() === estadoData.ESTADO_CLAVE.toLowerCase()
          );

          if (existeEstado) {
            result.errors.push({
              row: i + 2,
              error: 'El estado ya existe',
              data: estadoData
            });
            continue;
          }

          // Crear el estado
          await createCentroEstado({
            clave: estadoData.ESTADO_CLAVE.toUpperCase(),
            nombre: estadoData.ESTADO_NOMBRE,
            publicado: true // Por defecto los importados se publican
          });

          result.success++;
        } catch (err: any) {
          result.errors.push({
            row: i + 2,
            error: err.message || 'Error al crear el estado',
            data: estadoData
          });
        }
      }

      setImportResult(result);
      
      // Recargar datos si se importó al menos uno
      if (result.success > 0) {
        await loadEstados();
        await loadEstadisticas();
      }

    } catch (err: any) {
      setError(`Error al procesar el archivo CSV: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Función para generar CSV de ejemplo
  const downloadSampleCSV = () => {
    const sampleData = `ESTADO_CLAVE,ESTADO_NOMBRE
CDMX,"Ciudad de México"
JAL,Jalisco
NL,"Nuevo León"
BC,"Baja California"
SON,Sonora`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ejemplo_estados.csv';
    link.click();
  };

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Por favor selecciona un archivo CSV válido');
        return;
      }
      handleCSVImport(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-text-muted">Cargando estados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-primary">Gestión de Estados</h1>
        <div className="flex items-center gap-3">
          {/* Botón de importación CSV */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-secondary flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </button>
            </DialogTrigger>
            <DialogContent className="bg-bg-light border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-primary">Importar Estados desde CSV</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Instrucciones */}
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-medium text-accent-dark mb-2">Formato requerido:</h4>
                  <ul className="text-sm text-text-muted space-y-1">
                    <li>• El archivo debe ser formato CSV</li>
                    <li>• Debe contener las columnas: <code className="bg-bg px-1 rounded">ESTADO_CLAVE</code> y <code className="bg-bg px-1 rounded">ESTADO_NOMBRE</code></li>
                    <li>• La primera fila debe contener los encabezados</li>
                    <li>• Los estados importados se publicarán automáticamente</li>
                  </ul>
                </div>

                {/* Botón de descarga de ejemplo */}
                <div className="flex justify-center">
                  <button
                    onClick={downloadSampleCSV}
                    className="btn-outline-primary flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar CSV de Ejemplo
                  </button>
                </div>

                {/* Input de archivo */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text mb-2">Selecciona tu archivo CSV</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="btn-primary"
                  >
                    {importing ? 'Procesando...' : 'Seleccionar Archivo'}
                  </button>
                </div>

                {/* Resultado de la importación */}
                {importResult && (
                  <div className="space-y-4">
                    <div className="bg-bg border border-border rounded-lg p-4">
                      <h4 className="font-medium text-text mb-3">Resultado de la Importación</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-accent-dark">{importResult.total}</div>
                          <div className="text-sm text-text-muted">Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                          <div className="text-sm text-text-muted">Exitosos</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                          <div className="text-sm text-text-muted">Errores</div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de errores */}
                    {importResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <h5 className="font-medium text-red-800 mb-2">Errores encontrados:</h5>
                        <div className="space-y-1">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700">
                              Fila {error.row}: {error.error} ({error.data.ESTADO_CLAVE} - {error.data.ESTADO_NOMBRE})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setImportResult(null);
                          setIsImportDialogOpen(false);
                        }}
                        className="btn-primary"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón nuevo estado individual */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={handleOpenDialog} className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Estado
              </button>
            </DialogTrigger>
            <DialogContent className="bg-bg-light border-border">
              <DialogHeader>
                <DialogTitle className="text-primary">
                  {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clave" className="text-text font-medium">Clave *</Label>
                  <input
                    id="clave"
                    value={formData.clave}
                    onChange={(e) => setFormData(prev => ({ ...prev, clave: e.target.value }))}
                    placeholder="Ej: CDMX, JAL, NL"
                    className="input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-text font-medium">Nombre *</Label>
                  <input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Ciudad de México, Jalisco, Nuevo León"
                    className="input"
                    required
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicado: checked }))}
                  />
                  <Label htmlFor="publicado" className="text-text">Publicado</Label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsDialogOpen(false)}
                    className="btn-outline-primary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingEstado ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-muted">Estados</h3>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Globe className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-secondary mb-2">{estadisticas.estados.total}</div>
            <div className="text-xs text-text-muted mb-3">
              {estadisticas.estados.publicados} publicados, {estadisticas.estados.borradores} borradores
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-gradient-secondary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${estadisticas.estados.total > 0 ? Math.round((estadisticas.estados.publicados / estadisticas.estados.total) * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          <div className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-muted">Centros</h3>
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">{estadisticas.centros.total}</div>
            <div className="text-xs text-text-muted mb-3">
              {estadisticas.centros.publicados} publicados, {estadisticas.centros.borradores} borradores
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${estadisticas.centros.total > 0 ? Math.round((estadisticas.centros.publicados / estadisticas.centros.total) * 100) : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-bg-light rounded-lg border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            placeholder="Buscar estados por nombre o clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-text"
          />
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lista de estados */}
      {filteredEstados.length > 0 ? (
        <>
          {/* Contador */}
          <div className="flex items-center justify-between">
            <p className="text-text-muted">
              {filteredEstados.length} {filteredEstados.length === 1 ? 'estado encontrado' : 'estados encontrados'}
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                {filteredEstados.filter(e => e.publicado).length} Publicados
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-border rounded-full"></div>
                {filteredEstados.filter(e => !e.publicado).length} Borradores
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredEstados.map((estado) => (
              <div 
                key={estado.id} 
                className="bg-bg-light rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-text">{estado.nombre}</h3>
                      <p className="text-sm text-text-muted">Clave: {estado.clave}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      estado.publicado 
                        ? 'bg-accent text-black' 
                        : 'bg-bg text-text-muted border border-border'
                    }`}>
                      {estado.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(estado)}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(estado.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-bg-light rounded-lg border border-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              {searchTerm ? 'No se encontraron estados' : 'No hay estados registrados'}
            </h3>
            <p className="text-text-muted mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando estados individualmente o importa desde un archivo CSV'
              }
            </p>
            {!searchTerm && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={handleOpenDialog} className="btn-primary flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Estado
                </button>
                <button onClick={() => setIsImportDialogOpen(true)} className="btn-secondary flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}