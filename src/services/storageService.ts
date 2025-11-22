// src/services/storageService.ts
import { supabase } from '../lib/supabase';

export const STORAGE_BUCKETS = {
  SLIDERS: 'sliders',
  EXAMENES: 'examenes', 
  GENERAL: 'general',
  CENTROS: 'centros'
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

  // Validar tipo de archivo de audio
  static validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'audio/mpeg', 
    'audio/mp3', 
    'audio/wav', 
    'audio/ogg', 
    'audio/m4a', 
    'audio/webm',
    'audio/mp4'
  ];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten: MP3, WAV, OGG, M4A, WebM'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 50MB'
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

  // Agregar estas funciones al StorageService.ts

// Extraer nombre de archivo desde URL de Supabase
static extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Formato: /storage/v1/object/public/bucket/path/to/file.ext
    const pathParts = urlObj.pathname.split('/');
    const publicIndex = pathParts.indexOf('public');
    
    if (publicIndex !== -1 && publicIndex + 2 < pathParts.length) {
      // Omitir 'public' y 'bucket', tomar el resto como path
      return pathParts.slice(publicIndex + 2).join('/');
    }
    
    return null;
  } catch (error) {
    console.warn('Error extrayendo path de URL:', url, error);
    return null;
  }
}

// Eliminar archivo por URL
static async deleteFileByUrl(url: string): Promise<boolean> {
  try {
    // Verificar autenticación
    await this.verifyAuth();
    
    const filePath = this.extractFilePathFromUrl(url);
    if (!filePath) {
      console.warn('No se pudo extraer path de URL:', url);
      return false;
    }
    
    // Determinar el bucket basado en el path
    let bucket: string = STORAGE_BUCKETS.EXAMENES; // Por defecto
    if (filePath.startsWith('editor-images/')) {
      bucket = STORAGE_BUCKETS.EXAMENES;
    } else if (filePath.startsWith('editor-audios/')) {
      bucket = STORAGE_BUCKETS.EXAMENES;
    } else if (filePath.startsWith('sliders/')) {
      bucket = STORAGE_BUCKETS.SLIDERS;
    } else if (filePath.startsWith('general/')) {
      bucket = STORAGE_BUCKETS.GENERAL;
    } else if (filePath.startsWith('centros/')) { 
      bucket = STORAGE_BUCKETS.CENTROS;
    }
    
    console.log('🗑️ Eliminando archivo:', { bucket, path: filePath, url });
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error eliminando archivo del storage:', error);
      return false;
    }
    
    console.log('✅ Archivo eliminado del storage:', filePath);
    return true;
  } catch (error) {
    console.error('Error en deleteFileByUrl:', error);
    return false;
  }
}

// Limpiar archivos huérfanos de un contenido HTML
static async cleanupOrphanedFiles(oldContent: string, newContent: string): Promise<void> {
  try {
    const oldUrls = this.extractUrlsFromContent(oldContent);
    const newUrls = this.extractUrlsFromContent(newContent);
    
    // Encontrar URLs que ya no están en el nuevo contenido
    const orphanedUrls = oldUrls.filter(url => !newUrls.includes(url));
    
    if (orphanedUrls.length > 0) {
      console.log('🧹 Limpiando archivos huérfanos:', orphanedUrls.length);
      
      for (const url of orphanedUrls) {
        await this.deleteFileByUrl(url);
      }
      
      console.log('✅ Limpieza completada');
    }
  } catch (error) {
    console.error('Error en limpieza de archivos:', error);
  }
}

// Extraer todas las URLs de Supabase Storage de un contenido HTML
static extractUrlsFromContent(content: string): string[] {
  if (!content) return [];
  
  const urls: string[] = [];
  
  // Regex para encontrar URLs de Supabase Storage
  const supabaseUrlRegex = /https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s\)"\]>]+/g;
  const matches = content.match(supabaseUrlRegex);
  
  if (matches) {
    urls.push(...matches);
  }
  
  return [...new Set(urls)]; // Eliminar duplicados
}

// Función para usar en el ExamenService cuando se actualiza contenido
static async handleContentUpdate(oldContent: string, newContent: string): Promise<void> {
  // Ejecutar limpieza en background para no bloquear la UI
  setTimeout(async () => {
    await this.cleanupOrphanedFiles(oldContent, newContent);
  }, 1000);
}

// Función auxiliar para verificar si una URL es de Supabase Storage
static isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/storage/v1/object/public/');
  } catch (error) {
    return false;
  }
}

}