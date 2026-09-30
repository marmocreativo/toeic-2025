// src/services/anuncioService.ts

import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type { 
  Anuncio, 
  AnuncioFormData, 
  AnuncioCreateData, 
  AnuncioUpdateData,
  AnuncioFilters,
  AnuncioStats,
  AnuncioActivo
} from '../types/anuncio';

export const anuncioService = {
  // =============================================
  // CRUD PRINCIPAL DE ANUNCIOS
  // =============================================

  // Obtener todos los anuncios
  async getAnuncios(filters?: AnuncioFilters): Promise<Anuncio[]> {
    try {
      let query = supabase
        .from('anuncios')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters) {
        if (filters.active !== undefined) {
          query = query.eq('active', filters.active);
        }

        if (filters.search) {
          query = query.or(`titulo_es.ilike.%${filters.search}%,titulo_en.ilike.%${filters.search}%`);
        }

        if (filters.fecha_desde) {
          query = query.gte('start_date', filters.fecha_desde);
        }

        if (filters.fecha_hasta) {
          query = query.lte('end_date', filters.fecha_hasta);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo anuncios:', error);
      throw error;
    }
  },

  // Obtener anuncio por ID
  async getAnuncioById(id: number): Promise<Anuncio | null> {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo anuncio:', error);
      throw error;
    }
  },

  // Crear nuevo anuncio
  async createAnuncio(anuncioData: AnuncioCreateData): Promise<Anuncio> {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .insert([anuncioData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando anuncio:', error);
      throw error;
    }
  },

  // Actualizar anuncio
  async updateAnuncio(id: number, anuncioData: AnuncioUpdateData): Promise<Anuncio> {
    try {
      // Obtener anuncio actual para manejo de archivos
      const currentAnuncio = await this.getAnuncioById(id);
      
      if (!currentAnuncio) {
        throw new Error('Anuncio no encontrado');
      }

      // Identificar archivos que han cambiado para eliminación
      const filesToDelete: string[] = [];
      
      if (anuncioData.img_es !== undefined && 
          currentAnuncio.img_es && 
          anuncioData.img_es !== currentAnuncio.img_es) {
        const oldImagePath = this.extractPathFromUrl(currentAnuncio.img_es);
        if (oldImagePath) filesToDelete.push(oldImagePath);
      }
      
      if (anuncioData.img_en !== undefined && 
          currentAnuncio.img_en && 
          anuncioData.img_en !== currentAnuncio.img_en) {
        const oldImagePath = this.extractPathFromUrl(currentAnuncio.img_en);
        if (oldImagePath) filesToDelete.push(oldImagePath);
      }

      const { data, error } = await supabase
        .from('anuncios')
        .update({
          ...anuncioData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Eliminar archivos antiguos del storage
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.GENERAL, filePath);
          console.log(`Archivo anterior eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo anterior: ${filePath}`, error);
        }
      }

      return data;
    } catch (error) {
      console.error('Error actualizando anuncio:', error);
      throw error;
    }
  },

  // Eliminar anuncio
  async deleteAnuncio(id: number): Promise<void> {
    try {
      // Obtener anuncio para conocer sus archivos
      const anuncio = await this.getAnuncioById(id);
      
      if (!anuncio) {
        throw new Error('Anuncio no encontrado');
      }

      // Eliminar archivos del storage
      const filesToDelete: string[] = [];
      
      if (anuncio.img_es) {
        const imagePath = this.extractPathFromUrl(anuncio.img_es);
        if (imagePath) filesToDelete.push(imagePath);
      }
      
      if (anuncio.img_en) {
        const imagePath = this.extractPathFromUrl(anuncio.img_en);
        if (imagePath) filesToDelete.push(imagePath);
      }

      // Eliminar archivos del bucket
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.GENERAL, filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo: ${filePath}`, error);
        }
      }

      // Eliminar registro de la base de datos
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`Anuncio ${id} eliminado exitosamente`);
    } catch (error) {
      console.error('Error eliminando anuncio:', error);
      throw error;
    }
  },

  // Cambiar estado activo
  async toggleActive(id: number, active: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error cambiando estado:', error);
      throw error;
    }
  },

  // =============================================
  // FUNCIONES PARA EL FRONTEND PÚBLICO
  // =============================================

  // Obtener anuncio activo vigente
  async getAnuncioActivo(language: 'es' | 'en' = 'es'): Promise<AnuncioActivo | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Determinar imagen y título según el idioma
      const imagen = language === 'es' ? data.img_es : data.img_en;
      const titulo = language === 'es' ? data.titulo_es : data.titulo_en;

      // Si no hay imagen para el idioma solicitado, usar la del otro idioma
      const imagenFinal = imagen || (language === 'es' ? data.img_en : data.img_es);
      const tituloFinal = titulo || (language === 'es' ? data.titulo_en : data.titulo_es);

      if (!imagenFinal) return null;

      return {
        id: data.id,
        imagen: imagenFinal,
        titulo: tituloFinal || '',
        link: data.link
      };
    } catch (error) {
      console.error('Error obteniendo anuncio activo:', error);
      return null; // No mostrar anuncio si hay error
    }
  },

  // =============================================
  // ESTADÍSTICAS
  // =============================================

  // Obtener estadísticas
  async getStats(): Promise<AnuncioStats> {
    try {
      const anuncios = await this.getAnuncios();
      const today = new Date().toISOString().split('T')[0];
      
      const total = anuncios.length;
      const activos = anuncios.filter(a => a.active).length;
      const inactivos = total - activos;
      
      // Anuncios vigentes (activos y dentro del rango de fechas)
      const vigentes = anuncios.filter(a => 
        a.active && 
        a.start_date <= today && 
        a.end_date >= today
      ).length;
      
      // Anuncios programados (activos con fecha futura)
      const programados = anuncios.filter(a => 
        a.active && 
        a.start_date > today
      ).length;
      
      // Anuncios expirados (activos con fecha pasada)
      const expirados = anuncios.filter(a => 
        a.active && 
        a.end_date < today
      ).length;

      return {
        total,
        activos,
        inactivos,
        vigentes,
        programados,
        expirados
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  // Extraer path del archivo desde URL (toeic.mx/buckets/)
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      const bucketsIndex = pathParts.indexOf('buckets');
      const bucketIndex = bucketsIndex + 1;
      const filePathIndex = bucketIndex + 1;

      if (
        bucketsIndex !== -1 &&
        pathParts[bucketIndex] === STORAGE_BUCKETS.GENERAL &&
        filePathIndex < pathParts.length
      ) {
        return pathParts.slice(filePathIndex).join('/');
      }

      return null;
    } catch (error) {
      console.warn('No se pudo extraer path de URL:', url, error);
      return null;
    }
  },

  // Validar fechas
  validateDates(startDate: string, endDate: string): { valid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return {
        valid: false,
        error: 'La fecha de inicio debe ser anterior a la fecha de fin'
      };
    }
    
    return { valid: true };
  },

  // Validar datos del formulario
  validateAnuncioData(data: AnuncioFormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Fechas
    if (!data.start_date) {
      errors.push('La fecha de inicio es requerida');
    }
    
    if (!data.end_date) {
      errors.push('La fecha de fin es requerida');
    }
    
    if (data.start_date && data.end_date) {
      const dateValidation = this.validateDates(data.start_date, data.end_date);
      if (!dateValidation.valid && dateValidation.error) {
        errors.push(dateValidation.error);
      }
    }

    // Al menos una imagen
    if (!data.img_es && !data.img_en) {
      errors.push('Se requiere al menos una imagen (español o inglés)');
    }

    // Al menos un título
    if (!data.titulo_es && !data.titulo_en) {
      errors.push('Se requiere al menos un título (español o inglés)');
    }

    // Link válido si se proporciona
    if (data.link && data.link.trim() !== '') {
      try {
        new URL(data.link);
      } catch {
        errors.push('El enlace debe ser una URL válida');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Buscar anuncios
  async searchAnuncios(query: string): Promise<Anuncio[]> {
    return await this.getAnuncios({ search: query });
  }
};