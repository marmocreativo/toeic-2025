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

  // Actualizar slider (CON manejo de archivos viejos)
  async updateSlider(id: number, sliderData: Partial<SliderFormData>): Promise<Slider> {
    try {
      // 1. Obtener el slider actual para comparar archivos
      const currentSlider = await this.getSliderById(id);
      
      if (!currentSlider) {
        throw new Error('Slider no encontrado');
      }

      // 2. Identificar archivos que han cambiado y necesitan ser eliminados
      const filesToDelete: string[] = [];
      
      // Si la imagen cambió, eliminar la anterior (solo si la nueva no es vacía y es diferente)
      if (sliderData.imagen !== undefined && 
          currentSlider.imagen && 
          sliderData.imagen !== currentSlider.imagen) {
        const oldImagePath = this.extractPathFromUrl(currentSlider.imagen);
        if (oldImagePath) filesToDelete.push(oldImagePath);
      }
      
      // Si el logo cambió, eliminar el anterior (solo si el nuevo no es vacío y es diferente)
      if (sliderData.logo !== undefined && 
          currentSlider.logo && 
          sliderData.logo !== currentSlider.logo) {
        const oldLogoPath = this.extractPathFromUrl(currentSlider.logo);
        if (oldLogoPath) filesToDelete.push(oldLogoPath);
      }

      // 3. Actualizar en la base de datos
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

      // 4. Eliminar archivos viejos del storage (después de la actualización exitosa)
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.SLIDERS, filePath);
          console.log(`Archivo anterior eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo anterior: ${filePath}`, error);
          // No lanzar error, solo advertir
        }
      }

      if (filesToDelete.length > 0) {
        console.log(`Slider ${id} actualizado exitosamente. Archivos eliminados: ${filesToDelete.length}`);
      }
      
      return data;

    } catch (error) {
      console.error('Error actualizando slider:', error);
      throw error;
    }
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

  // Función auxiliar para verificar si una URL es del storage de Supabase
  isSupabaseStorageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes('/storage/v1/object/public/');
    } catch (error) {
      return false;
    }
  },

  // Función auxiliar para limpiar archivo específico si es de Supabase Storage
  async cleanupFileIfNeeded(url: string | null): Promise<void> {
    if (!url || !this.isSupabaseStorageUrl(url)) {
      return; // No es una URL de Supabase Storage, no hacer nada
    }

    const filePath = this.extractPathFromUrl(url);
    if (filePath) {
      try {
        await StorageService.deleteFile(STORAGE_BUCKETS.SLIDERS, filePath);
        console.log(`Archivo limpiado: ${filePath}`);
      } catch (error) {
        console.warn(`No se pudo limpiar archivo: ${filePath}`, error);
      }
    }
  },

  // Duplicar slider (útil para crear variaciones)
  async duplicateSlider(id: number): Promise<Slider> {
    try {
      const originalSlider = await this.getSliderById(id);
      
      if (!originalSlider) {
        throw new Error('Slider no encontrado');
      }

      // Crear datos para el nuevo slider (sin id, created_at, updated_at)
      const newSliderData: SliderFormData = {
        titulo: `${originalSlider.titulo} (Copia)`,
        subtitulo: originalSlider.subtitulo || '',
        extra: originalSlider.extra || '',
        boton_texto: originalSlider.boton_texto || '',
        boton_enlace: originalSlider.boton_enlace || '',
        en_titulo: originalSlider.en_titulo || '',
        en_subtitulo: originalSlider.en_subtitulo || '',
        en_extra: originalSlider.en_extra || '',
        en_boton_texto: originalSlider.en_boton_texto || '',
        imagen: originalSlider.imagen || '',
        logo: originalSlider.logo || '',
        publicado: false // Los duplicados empiezan como borrador
      };

      return await this.createSlider(newSliderData);

    } catch (error) {
      console.error('Error duplicando slider:', error);
      throw error;
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
  },

  // Obtener slider anterior/siguiente (útil para navegación)
  async getAdjacentSliders(currentId: number): Promise<{
    previous: Slider | null;
    next: Slider | null;
  }> {
    try {
      const sliders = await this.getSliders();
      const currentIndex = sliders.findIndex(s => s.id === currentId);
      
      if (currentIndex === -1) {
        return { previous: null, next: null };
      }
      
      return {
        previous: currentIndex > 0 ? sliders[currentIndex - 1] : null,
        next: currentIndex < sliders.length - 1 ? sliders[currentIndex + 1] : null
      };
    } catch (error) {
      console.error('Error obteniendo sliders adyacentes:', error);
      throw error;
    }
  },

  // Reordenar sliders (si implementas ordenamiento manual)
  async reorderSliders(orderedIds: number[]): Promise<void> {
    try {
      // Actualizar orden de cada slider
      const updatePromises = orderedIds.map((id, index) => 
        supabase
          .from('sliders')
          .update({ 
            orden: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar si alguna actualización falló
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Error reordenando sliders: ${errors[0].error?.message}`);
      }

    } catch (error) {
      console.error('Error reordenando sliders:', error);
      throw error;
    }
  }
};