// src/services/storageService.ts
import { supabase } from '../lib/supabase';

export const STORAGE_BUCKETS = {
  SLIDERS: 'sliders',
  EXAMENES: 'examenes', 
  GENERAL: 'general'
} as const;

export class StorageService {
  // Verificar autenticación antes de cualquier operación
  private static async verifyAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error verificando autenticación:', error);
      throw new Error('Error de autenticación');
    }
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    return user;
  }

  // Subir archivo
  static async uploadFile(
    bucket: string, 
    path: string, 
    file: File,
    options?: { upsert?: boolean }
  ): Promise<string> {
    try {
      // Verificar autenticación primero
      const user = await this.verifyAuth();
      
      console.log('Subiendo archivo:', {
        bucket,
        path,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id
      });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: options?.upsert || false
        });

      if (error) {
        console.error('Error detallado de Supabase:', error);
        
        // Mensajes de error más específicos
        if (error.message.includes('row-level security')) {
          throw new Error('Error de permisos: Verifica las políticas RLS del storage');
        }
        if (error.message.includes('Bucket not found')) {
          throw new Error(`Bucket '${bucket}' no encontrado`);
        }
        if (error.message.includes('already exists')) {
          throw new Error('El archivo ya existe. Usa upsert: true para sobrescribir');
        }
        
        throw new Error(`Error subiendo archivo: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('Upload exitoso:', {
        path: data.path,
        url: urlData.publicUrl
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error en uploadFile:', error);
      throw error;
    }
  }

  // Eliminar archivo
  static async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      // Verificar autenticación
      await this.verifyAuth();

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Error eliminando archivo:', error);
        throw new Error(`Error eliminando archivo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deleteFile:', error);
      throw error;
    }
  }

  // Obtener URL pública (no requiere autenticación)
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Generar nombre único para archivo
  static generateFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return `${prefix ? prefix + '-' : ''}${baseName}-${timestamp}-${random}.${extension}`;
  }

  // Validar tipo de archivo
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB'
      };
    }

    return { valid: true };
  }

  // Verificar estado del storage (útil para debugging)
  static async checkStorageStatus(): Promise<{
    isAuthenticated: boolean;
    buckets: string[];
    canUpload: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          isAuthenticated: false,
          buckets: [],
          canUpload: false,
          error: authError?.message || 'Usuario no autenticado'
        };
      }

      // Listar buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        return {
          isAuthenticated: true,
          buckets: [],
          canUpload: false,
          user,
          error: `Error listando buckets: ${bucketsError.message}`
        };
      }

      // Probar upload con archivo pequeño
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const testPath = `test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.SLIDERS)
        .upload(testPath, testFile);

      // Limpiar archivo de prueba
      if (!uploadError) {
        await supabase.storage
          .from(STORAGE_BUCKETS.SLIDERS)
          .remove([testPath]);
      }

      return {
        isAuthenticated: true,
        buckets: buckets?.map(b => b.name) || [],
        canUpload: !uploadError,
        user,
        error: uploadError?.message
      };

    } catch (error) {
      return {
        isAuthenticated: false,
        buckets: [],
        canUpload: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Listar archivos en un bucket
  static async listFiles(bucket: string, folder?: string): Promise<any[]> {
    try {
      await this.verifyAuth();

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder || '', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listando archivos:', error);
        throw new Error(`Error listando archivos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en listFiles:', error);
      throw error;
    }
  }
}