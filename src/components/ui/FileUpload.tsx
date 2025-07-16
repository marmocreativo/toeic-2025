// src/components/ui/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Alert, AlertDescription } from './alert';
import { Upload, X, Image, RefreshCw, FileText } from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface FileUploadProps {
  // Props originales para compatibilidad con ExamenForm
  onFileSelect?: (file: File) => void | Promise<any>;
  loading?: boolean;
  currentImage?: string;
  preview?: string;
  
  // Props nuevas para el patrón de otros formularios
  bucket?: string;
  onUpload?: (url: string) => void;
  currentFile?: string;
  acceptedTypes?: string[];
  maxSize?: number; // en bytes
  
  // Props comunes
  accept?: string;
  description?: string;
  onRemove?: () => void;
  uploading?: boolean;
  progress?: number;
  error?: string | null;
  label?: string;
  disabled?: boolean;
}

export function FileUpload({
  // Props originales
  onFileSelect,
  loading = false,
  currentImage,
  preview,
  
  // Props nuevas
  bucket,
  onUpload,
  currentFile,
  acceptedTypes,
  maxSize: maxSizeBytes,
  
  // Props comunes
  accept,
  description,
  onRemove,
  uploading = false,
  progress = 0,
  error: externalError,
  label,
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalUploading, setInternalUploading] = useState(false);

  // Determinar configuración basada en props
  const isNewPattern = bucket && onUpload;
  const isPDFMode = acceptedTypes?.includes('application/pdf');
  
  // Configuración automática
  const finalAccept = accept || (isPDFMode ? 'application/pdf' : 'image/*');
  const finalMaxSize = maxSizeBytes || (isPDFMode ? 10 * 1024 * 1024 : 5 * 1024 * 1024); // 10MB para PDF, 5MB para imágenes
  const finalLabel = label || (isPDFMode ? 'Seleccionar PDF' : 'Seleccionar Imagen');
  
  // Vista previa
  const fileUrl = currentFile || currentImage || preview;
  
  // Estados
  const errorMessage = externalError || internalError;
  const isLoading = loading || uploading || internalUploading || disabled;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validar tamaño
    if (file.size > finalMaxSize) {
      const maxMB = Math.round(finalMaxSize / (1024 * 1024));
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo ${maxMB}MB.`
      };
    }

    // Validar tipo
    if (isPDFMode) {
      if (file.type !== 'application/pdf') {
        return {
          valid: false,
          error: 'Solo se permiten archivos PDF.'
        };
      }
    } else if (acceptedTypes) {
      if (!acceptedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Tipo de archivo no permitido. Tipos válidos: ${acceptedTypes.join(', ')}`
        };
      }
    } else if (finalAccept === 'image/*' && !file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Solo se permiten archivos de imagen.'
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (file: File) => {
    setInternalError(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setInternalError(validation.error!);
      return;
    }

    if (isNewPattern && bucket && onUpload) {
      // Patrón nuevo: subir automáticamente
      try {
        setInternalUploading(true);
        
        const fileName = StorageService.generateFileName(file.name);
        const url = await StorageService.uploadFile(bucket, fileName, file);
        
        onUpload(url);
      } catch (error) {
        setInternalError(error instanceof Error ? error.message : 'Error subiendo archivo');
      } finally {
        setInternalUploading(false);
      }
    } else if (onFileSelect) {
      // Patrón original: solo pasar el archivo
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setInternalError(null);
    
    if (onRemove) {
      onRemove();
    } else if (onFileSelect) {
      onFileSelect(null as any);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || 'archivo';
  };

  const getDefaultDescription = () => {
    if (isPDFMode) {
      return `Archivos PDF. Máximo ${Math.round(finalMaxSize / (1024 * 1024))}MB.`;
    }
    return `Archivos de imagen: JPG, PNG, WebP. Máximo ${Math.round(finalMaxSize / (1024 * 1024))}MB.`;
  };

  return (
    <div className="space-y-4">
      {/* Vista previa */}
      {fileUrl && (
        <div className="relative inline-block">
          {isPDFMode ? (
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
              <FileText className="w-8 h-8 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{getFileNameFromUrl(fileUrl)}</p>
                <p className="text-xs text-gray-500">Archivo PDF</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={fileUrl}
                alt="Vista previa"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Área de upload */}
      <Card
        className={`
          border-2 border-dashed p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={finalAccept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <RefreshCw className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              {progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <>
              {isPDFMode ? (
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              )}
            </>
          )}

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isLoading ? 'Subiendo archivo...' : `Selecciona o arrastra ${isPDFMode ? 'un PDF' : 'una imagen'}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {description || getDefaultDescription()}
            </p>
            {progress > 0 && isLoading && (
              <p className="text-sm text-blue-600 mt-1">
                {progress}% completado
              </p>
            )}
          </div>

          {!isLoading && (
            <Button type="button" variant="outline">
              {isPDFMode ? (
                <FileText className="h-4 w-4 mr-2" />
              ) : (
                <Image className="h-4 w-4 mr-2" />
              )}
              {finalLabel}
            </Button>
          )}
        </div>
      </Card>

      {/* Error */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// También exportamos como default para compatibilidad
export default FileUpload;