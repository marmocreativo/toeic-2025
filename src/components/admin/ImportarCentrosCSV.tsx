// src/components/admin/ImportarCentrosCSV.tsx

import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, FileText, Eye, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import Papa from 'papaparse';
import { importarCentrosCSV, generarCSVEjemplo, type ImportResult, type CentroCSVRow } from '../../services/centroService';

interface ImportarCentrosCSVProps {
  onImportComplete: () => void;
}

export default function ImportarCentrosCSV({ onImportComplete }: ImportarCentrosCSVProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState<CentroCSVRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido');
      return;
    }

    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error al leer el archivo CSV: ' + results.errors[0].message);
          return;
        }

        const data = results.data as CentroCSVRow[];
        
        // Validar que tenga las columnas requeridas
        const requiredColumns = [
          'CENTRO_CLAVE_ESTADO',
          'CENTRO_NOMBRE',
          'CENTRO_DIRECCION',
          'CENTRO_TELEFONO',
          'CENTRO_CORREO',
          'CENTRO_IMAGEN'
        ];

        const fileColumns = Object.keys(data[0] || {});
        const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

        if (missingColumns.length > 0) {
          setError(`El archivo CSV debe contener las siguientes columnas: ${missingColumns.join(', ')}`);
          return;
        }

        setCsvData(data);
        setShowPreview(true);
      },
      error: (error) => {
        setError('Error al procesar el archivo: ' + error.message);
      }
    });
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const result = await importarCentrosCSV(csvData);
      setImportResult(result);
      
      if (result.exitosos > 0) {
        onImportComplete();
      }
    } catch (err) {
      setError('Error durante la importación: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsImporting(false);
    }
  };

  const descargarCSVEjemplo = () => {
    const csvContent = generarCSVEjemplo();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ejemplo_centros.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setImportResult(null);
    setError(null);
    setCsvData([]);
    setShowPreview(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetImport();
    }
    setIsDialogOpen(open);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border hover:bg-primary/10 hover:border-primary/30">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium text-primary">
            Importar Centros desde CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instrucciones */}
          <Card className="bg-bg rounded-lg border border-border">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Instrucciones de uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-text-muted">
                <p className="mb-3">El archivo CSV debe contener exactamente estas columnas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Requerido</Badge>
                      <span className="font-medium">CENTRO_CLAVE_ESTADO</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Requerido</Badge>
                      <span className="font-medium">CENTRO_NOMBRE</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                      <span className="font-medium">CENTRO_DIRECCION</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                      <span className="font-medium">CENTRO_TELEFONO</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                      <span className="font-medium">CENTRO_CORREO</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                      <span className="font-medium">CENTRO_IMAGEN</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm"><strong>Nota:</strong> Las imágenes deben estar en la carpeta <code>/public/images/centros/</code></p>
                </div>
              </div>
              <Button 
                onClick={descargarCSVEjemplo} 
                variant="outline" 
                size="sm"
                className="border-border hover:bg-bg"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar ejemplo CSV
              </Button>
            </CardContent>
          </Card>

          {/* Upload */}
          {!showPreview && !importResult && (
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Seleccionar archivo CSV</h3>
                    <p className="text-text-muted mb-4">Arrastra un archivo CSV aquí o haz clic para seleccionar</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="inline-flex items-center px-6 py-3 border border-border rounded-md shadow-sm text-sm font-medium text-text bg-bg-light hover:bg-bg cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Seleccionar archivo CSV
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {showPreview && !importResult && (
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Vista previa - {csvData.length} centros encontrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3">
                    {csvData.slice(0, 10).map((centro, index) => (
                      <div key={index} className="p-4 bg-bg rounded-lg border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-text">{centro.CENTRO_NOMBRE}</h4>
                              <Badge variant="outline" className="text-xs">
                                {centro.CENTRO_CLAVE_ESTADO}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-text-muted">
                              {centro.CENTRO_DIRECCION && (
                                <div>📍 {centro.CENTRO_DIRECCION}</div>
                              )}
                              <div className="flex flex-wrap gap-4">
                                {centro.CENTRO_TELEFONO && (
                                  <span>📞 {centro.CENTRO_TELEFONO}</span>
                                )}
                                {centro.CENTRO_CORREO && (
                                  <span>✉️ {centro.CENTRO_CORREO}</span>
                                )}
                                {centro.CENTRO_IMAGEN && (
                                  <span>🖼️ {centro.CENTRO_IMAGEN}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {csvData.length > 10 && (
                      <div className="text-sm text-text-muted text-center py-3 bg-bg rounded-lg">
                        ... y {csvData.length - 10} centros más
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-between items-center mt-6">
                  <Button variant="outline" onClick={resetImport}>
                    Seleccionar otro archivo
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {isImporting ? 'Importando...' : `Importar ${csvData.length} centros`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {isImporting && (
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <div>
                    <h3 className="text-lg font-medium text-text">Importando centros...</h3>
                    <p className="text-text-muted">Por favor espera mientras procesamos los datos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {importResult && (
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Resultado de la importación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-bg rounded-lg">
                    <div className="text-3xl font-bold text-text mb-1">{importResult.total}</div>
                    <div className="text-sm text-text-muted">Total procesados</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">{importResult.exitosos}</div>
                    <div className="text-sm text-green-700">Exitosos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 mb-1">{importResult.errores}</div>
                    <div className="text-sm text-red-700">Errores</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">{importResult.duplicados}</div>
                    <div className="text-sm text-yellow-700">Duplicados</div>
                  </div>
                </div>

                {/* Detalles */}
                <div>
                  <h4 className="font-medium text-text mb-3">Detalles del procesamiento:</h4>
                  <ScrollArea className="h-48 w-full">
                    <div className="space-y-2">
                      {importResult.detalles.map((detalle, index) => (
                        <div key={index} className="p-3 bg-bg rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {detalle.estado === 'exitoso' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {detalle.estado === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                              {detalle.estado === 'duplicado' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                              <span className="font-medium text-text">{detalle.nombre}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Fila {detalle.fila}
                            </Badge>
                          </div>
                          <div className="text-sm text-text-muted mt-1 ml-7">{detalle.mensaje}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button onClick={resetImport} variant="outline">
                    Importar otro archivo
                  </Button>
                  <Button 
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}