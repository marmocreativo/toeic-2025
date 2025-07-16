// src/hooks/useFileUpload.ts
import { useState } from 'react';
import { StorageService } from '../services/storageService';

interface UseFileUploadOptions {
  bucket: string;
  folder?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, customFileName?: string) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Validar archivo
      const validation = StorageService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generar nombre del archivo
      const fileName = customFileName || StorageService.generateFileName(file.name);
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      // Simular progreso (Supabase no tiene callback de progreso real)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Subir archivo
      const url = await StorageService.uploadFile(options.bucket, filePath, file, {
        upsert: true
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Callback de éxito
      if (options.onSuccess) {
        options.onSuccess(url);
      }

      return { url, path: filePath };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al subir el archivo';
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      await StorageService.deleteFile(options.bucket, path);
    } catch (err: any) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
    error,
    clearError: () => setError(null)
  };
}