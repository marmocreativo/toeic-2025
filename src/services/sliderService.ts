import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type { Slider, SliderFormData, SliderOrderUpdate, ReorderResult } from '../types/slider';

export const sliderService = {
  // Obtener todos los sliders ORDENADOS
  async getSliders(): Promise<Slider[]> {
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false }); // Fallback si orden es igual

    if (error) throw error;
    return data || [];
  },

  // Obtener sliders publicados ORDENADOS (para frontend público)
  async getPublishedSliders(): Promise<Slider[]> {
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .eq('publicado', true)
      .order('orden', { ascending: true })
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

  // Crear nuevo slider CON orden automático
  async createSlider(sliderData: SliderFormData): Promise<Slider> {
    try {
      // 1. Obtener el próximo número de orden
      const nextOrder = await this.getNextOrder();
      
      // 2. Crear el slider con el orden asignado
      const { data, error } = await supabase
        .from('sliders')
        .insert([{
          ...sliderData,
          orden: nextOrder
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando slider:', error);
      throw error;
    }
  },

  // Actualizar slider (CON manejo de archivos viejos y orden)
  async updateSlider(id: number, sliderData: Partial<SliderFormData>): Promise<Slider> {
    try {
      // 1. Obtener el slider actual para comparar archivos
      const currentSlider = await this.getSliderById(id);
      
      if (!currentSlider) {
        throw new Error('Slider no encontrado');
      }

      // 2. Identificar archivos que han cambiado y necesitan ser eliminados
      const filesToDelete: string[] = [];
      
      // Si la imagen cambió, eliminar la anterior
      if (sliderData.imagen !== undefined && 
          currentSlider.imagen && 
          sliderData.imagen !== currentSlider.imagen) {
        const oldImagePath = this.extractPathFromUrl(currentSlider.imagen);
        if (oldImagePath) filesToDelete.push(oldImagePath);
      }
      
      // Si el logo cambió, eliminar el anterior
      if (sliderData.logo !== undefined && 
          currentSlider.logo && 
          sliderData.logo !== currentSlider.logo) {
        const oldLogoPath = this.extractPathFromUrl(currentSlider.logo);
        if (oldLogoPath) filesToDelete.push(oldLogoPath);
      }

      // 3. Actualizar en la base de datos (sin modificar orden a menos que se especifique)
      const updateData: any = {
        ...sliderData,
        updated_at: new Date().toISOString()
      };

      // Solo incluir orden si se proporciona explícitamente
      if (sliderData.orden !== undefined) {
        updateData.orden = sliderData.orden;
      }

      const { data, error } = await supabase
        .from('sliders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 4. Eliminar archivos viejos del storage
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.SLIDERS, filePath);
          console.log(`Archivo anterior eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo anterior: ${filePath}`, error);
        }
      }

      return data;

    } catch (error) {
      console.error('Error actualizando slider:', error);
      throw error;
    }
  },

  // Eliminar slider (CON eliminación de archivos y reordenamiento)
  async deleteSlider(id: number): Promise<void> {
    try {
      // 1. Obtener el slider para conocer su orden y archivos
      const slider = await this.getSliderById(id);
      
      if (!slider) {
        throw new Error('Slider no encontrado');
      }

      const deletedOrder = slider.orden;

      // 2. Eliminar archivos del storage
      const filesToDelete: string[] = [];
      
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
        }
      }

      // 3. Eliminar el registro de la base de datos
      const { error } = await supabase
        .from('sliders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 4. Reordenar elementos posteriores (opcional - para mantener secuencia)
      await this.compactOrder(deletedOrder);

      console.log(`Slider ${id} eliminado exitosamente`);

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

  // ========================================================================
  // NUEVAS FUNCIONES DE ORDENAMIENTO
  // ========================================================================

  // Obtener el próximo número de orden
  async getNextOrder(): Promise<number> {
    const { data, error } = await supabase
      .from('sliders')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 1; // Primer elemento
    }

    return (data[0].orden || 0) + 1;
  },

  // Reordenar sliders completo (para drag & drop)
  async reorderSliders(orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      // Actualizar orden de cada slider
      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('sliders')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) {
            errors.push(`Error actualizando slider ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando slider ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando sliders:', error);
      throw error;
    }
  },

  // Mover un slider a una posición específica
  async moveSliderToPosition(sliderId: number, newPosition: number): Promise<void> {
    try {
      // 1. Obtener todos los sliders ordenados
      const sliders = await this.getSliders();
      
      // 2. Encontrar el slider actual
      const currentIndex = sliders.findIndex(s => s.id === sliderId);
      if (currentIndex === -1) {
        throw new Error('Slider no encontrado');
      }

      // 3. Remover el slider de su posición actual
      const [movedSlider] = sliders.splice(currentIndex, 1);
      
      // 4. Insertar en la nueva posición (ajustar índice si es necesario)
      const targetIndex = Math.max(0, Math.min(newPosition - 1, sliders.length));
      sliders.splice(targetIndex, 0, movedSlider);

      // 5. Actualizar todos los órdenes
      const orderedIds = sliders.map(s => s.id);
      await this.reorderSliders(orderedIds);

    } catch (error) {
      console.error('Error moviendo slider:', error);
      throw error;
    }
  },

  // Intercambiar posiciones de dos sliders
  async swapSliders(sliderId1: number, sliderId2: number): Promise<void> {
    try {
      const slider1 = await this.getSliderById(sliderId1);
      const slider2 = await this.getSliderById(sliderId2);

      if (!slider1 || !slider2) {
        throw new Error('Uno o ambos sliders no encontrados');
      }

      // Intercambiar órdenes
      const updates = [
        supabase
          .from('sliders')
          .update({ 
            orden: slider2.orden,
            updated_at: new Date().toISOString()
          })
          .eq('id', sliderId1),
        
        supabase
          .from('sliders')
          .update({ 
            orden: slider1.orden,
            updated_at: new Date().toISOString()
          })
          .eq('id', sliderId2)
      ];

      const results = await Promise.all(updates);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Error intercambiando sliders: ${errors[0].error?.message}`);
      }

    } catch (error) {
      console.error('Error intercambiando sliders:', error);
      throw error;
    }
  },

  // Compactar orden (eliminar huecos en la secuencia)
  async compactOrder(deletedOrder?: number): Promise<void> {
    try {
      const sliders = await this.getSliders();
      
      // Reasignar órdenes secuenciales
      const updatePromises = sliders.map((slider, index) => 
        supabase
          .from('sliders')
          .update({ 
            orden: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', slider.id)
      );

      await Promise.all(updatePromises);

    } catch (error) {
      console.error('Error compactando orden:', error);
      throw error;
    }
  },

  // Obtener sliders para lista de ordenamiento (datos mínimos)
  async getSlidersForOrdering(): Promise<Array<{
    id: number;
    titulo: string;
    publicado: boolean;
    orden: number;
  }>> {
    const { data, error } = await supabase
      .from('sliders')
      .select('id, titulo, publicado, orden')
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // ========================================================================
  // FUNCIONES EXISTENTES (sin cambios)
  // ========================================================================

  // Función auxiliar para extraer el path del archivo desde la URL pública
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      const publicIndex = pathParts.indexOf('public');
      const bucketIndex = publicIndex + 1;
      const filePathIndex = bucketIndex + 1;
      
      if (pathParts[bucketIndex] === STORAGE_BUCKETS.SLIDERS && filePathIndex < pathParts.length) {
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

  // Duplicar slider
  async duplicateSlider(id: number): Promise<Slider> {
    try {
      const originalSlider = await this.getSliderById(id);
      
      if (!originalSlider) {
        throw new Error('Slider no encontrado');
      }

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
        publicado: false
      };

      return await this.createSlider(newSliderData);

    } catch (error) {
      console.error('Error duplicando slider:', error);
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