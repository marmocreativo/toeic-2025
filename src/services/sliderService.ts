import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type { Slider, SliderFormData } from '../types/slider';

export const sliderService = {
  // Obtener todos los sliders
  async getSliders(): Promise<Slider[]> {
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener sliders publicados (para frontend público)
  async getPublishedSliders(): Promise<Slider[]> {
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener slider por ID
  async getSliderById(id: number): Promise<Slider | null> {
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Crear nuevo slider
  async createSlider(sliderData: SliderFormData): Promise<Slider> {
    const { data, error } = await supabase
      .from('sliders')
      .insert([sliderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar slider
  async updateSlider(id: number, sliderData: Partial<SliderFormData>): Promise<Slider> {
    const { data, error } = await supabase
      .from('sliders')
      .update({
        ...sliderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar slider (CON eliminación de archivos)
  async deleteSlider(id: number): Promise<void> {
    try {
      // 1. Primero obtener el slider para conocer sus archivos
      const slider = await this.getSliderById(id);
      
      if (!slider) {
        throw new Error('Slider no encontrado');
      }

      // 2. Eliminar archivos del storage
      const filesToDelete: string[] = [];
      
      // Extraer rutas de archivos de las URLs
      if (slider.imagen) {
        const imagePath = this.extractPathFromUrl(slider.imagen);
        if (imagePath) filesToDelete.push(imagePath);
      }
      
      if (slider.logo) {
        const logoPath = this.extractPathFromUrl(slider.logo);
        if (logoPath) filesToDelete.push(logoPath);
      }

      // Eliminar archivos del bucket
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.SLIDERS, filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo: ${filePath}`, error);
          // Continuar aunque falle la eliminación del archivo
        }
      }

      // 3. Eliminar el registro de la base de datos
      const { error } = await supabase
        .from('sliders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`Slider ${id} eliminado exitosamente con ${filesToDelete.length} archivos`);

    } catch (error) {
      console.error('Error eliminando slider:', error);
      throw error;
    }
  },

  // Cambiar estado publicado
  async togglePublished(id: number, publicado: boolean): Promise<void> {
    const { error } = await supabase
      .from('sliders')
      .update({ 
        publicado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Función auxiliar para extraer el path del archivo desde la URL pública
  extractPathFromUrl(url: string): string | null {
    try {
      // URLs de Supabase tienen el formato:
      // https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Buscar el índice donde está 'public' y el bucket
      const publicIndex = pathParts.indexOf('public');
      const bucketIndex = publicIndex + 1;
      const filePathIndex = bucketIndex + 1;
      
      if (pathParts[bucketIndex] === STORAGE_BUCKETS.SLIDERS && filePathIndex < pathParts.length) {
        // Unir todas las partes desde el archivo en adelante
        return pathParts.slice(filePathIndex).join('/');
      }
      
      return null;
    } catch (error) {
      console.warn('No se pudo extraer path de URL:', url, error);
      return null;
    }
  },

  // Limpiar archivos huérfanos (función de mantenimiento)
  async cleanOrphanedFiles(): Promise<{
    filesInStorage: number;
    filesInDatabase: number;
    orphanedFiles: string[];
    cleanedFiles: string[];
  }> {
    try {
      // 1. Obtener todos los archivos en el bucket
      const filesInStorage = await StorageService.listFiles(STORAGE_BUCKETS.SLIDERS);
      
      // 2. Obtener todas las URLs de imágenes en la base de datos
      const { data: sliders, error } = await supabase
        .from('sliders')
        .select('imagen, logo');
      
      if (error) throw error;
      
      // 3. Extraer paths de las URLs en la base de datos
      const pathsInDatabase = new Set<string>();
      
      sliders?.forEach(slider => {
        if (slider.imagen) {
          const path = this.extractPathFromUrl(slider.imagen);
          if (path) pathsInDatabase.add(path);
        }
        if (slider.logo) {
          const path = this.extractPathFromUrl(slider.logo);
          if (path) pathsInDatabase.add(path);
        }
      });
      
      // 4. Encontrar archivos huérfanos
      const orphanedFiles = filesInStorage
        .map(file => file.name)
        .filter(fileName => !pathsInDatabase.has(fileName));
      
      // 5. Eliminar archivos huérfanos (opcional - comentado por seguridad)
      const cleanedFiles: string[] = [];
      
      /* DESCOMENTAR PARA ACTIVAR LIMPIEZA AUTOMÁTICA
      for (const orphanedFile of orphanedFiles) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.SLIDERS, orphanedFile);
          cleanedFiles.push(orphanedFile);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo huérfano: ${orphanedFile}`, error);
        }
      }
      */
      
      return {
        filesInStorage: filesInStorage.length,
        filesInDatabase: pathsInDatabase.size,
        orphanedFiles,
        cleanedFiles
      };
      
    } catch (error) {
      console.error('Error limpiando archivos huérfanos:', error);
      throw error;
    }
  },

  // Estadísticas del slider
  async getStats(): Promise<{
    total: number;
    publicados: number;
    borradores: number;
    ultimaActualizacion: string | null;
  }> {
    try {
      const sliders = await this.getSliders();
      
      const total = sliders.length;
      const publicados = sliders.filter(s => s.publicado).length;
      const borradores = total - publicados;
      
      // Encontrar la última actualización
      const fechas = sliders
        .map(s => s.updated_at || s.created_at)
        .filter(Boolean)
        .sort()
        .reverse();
      
      const ultimaActualizacion = fechas.length > 0 ? fechas[0] : null;
      
      return {
        total,
        publicados,
        borradores,
        ultimaActualizacion
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};