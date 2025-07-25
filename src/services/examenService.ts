// src/services/examenService.ts
import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type {
  Examen,
  ExamenCompleto,
  ExamenFormData,
  ExamenHorario,
  ExamenExtra,
  ExamenFaq,
  ExamenMuestra,
  ExamenStats,
  ExamenCompletoFormData
} from '../types/examen';

export const examenService = {
  // =============================================
  // CRUD PRINCIPAL DE EXÁMENES
  // =============================================

  // Obtener todos los exámenes
  async getExamenes(): Promise<Examen[]> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener exámenes publicados (para frontend público)
  async getPublishedExamenes(): Promise<Examen[]> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener examen por ID
  async getExamenById(id: number): Promise<Examen | null> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Obtener examen por URL
  async getExamenByUrl(url: string): Promise<Examen | null> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('url', url)
      .eq('publicado', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Obtener examen completo con todas sus relaciones
  async getExamenCompleto(id: number): Promise<ExamenCompleto | null> {
    try {
      // Obtener examen principal
      const examen = await this.getExamenById(id);
      if (!examen) return null;

      // Obtener todas las relaciones en paralelo
      const [horarios, extras, faqs, muestras] = await Promise.all([
        this.getHorariosByExamenId(id),
        this.getExtrasByExamenId(id),
        this.getFaqsByExamenId(id),
        this.getMuestrasByExamenId(id)
      ]);

      return {
        ...examen,
        horarios,
        extras,
        faqs,
        muestras
      };
    } catch (error) {
      console.error('Error obteniendo examen completo:', error);
      throw error;
    }
  },

  // Crear nuevo examen
  async createExamen(examenData: ExamenFormData): Promise<Examen> {
    const { data, error } = await supabase
      .from('examenes')
      .insert([examenData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear examen completo con todas sus relaciones
  async createExamenCompleto(examenData: ExamenCompletoFormData): Promise<ExamenCompleto> {
    try {
      // 1. Crear examen principal
      const { horarios, extras, faqs, muestras, ...examenBase } = examenData;
      const examen = await this.createExamen(examenBase);

      // 2. Crear relaciones en paralelo si existen
      const promises = [];

      if (horarios && horarios.length > 0) {
        promises.push(this.createMultipleHorarios(examen.id, horarios));
      }

      if (extras && extras.length > 0) {
        promises.push(this.createMultipleExtras(examen.id, extras));
      }

      if (faqs && faqs.length > 0) {
        promises.push(this.createMultipleFaqs(examen.id, faqs));
      }

      if (muestras && muestras.length > 0) {
        promises.push(this.createMultipleMuestras(examen.id, muestras));
      }

      await Promise.all(promises);

      // 3. Retornar examen completo
      return await this.getExamenCompleto(examen.id) as ExamenCompleto;

    } catch (error) {
      console.error('Error creando examen completo:', error);
      throw error;
    }
  },

  // Actualizar examen
  async updateExamen(id: number, examenData: Partial<ExamenFormData>): Promise<Examen> {
    const { data, error } = await supabase
      .from('examenes')
      .update({
        ...examenData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar examen completo con todas sus relaciones
async updateExamenCompleto(id: number, examenData: ExamenCompletoFormData): Promise<ExamenCompleto> {
  try {
    console.log('=== INICIANDO UPDATE EXAMEN COMPLETO ===');
    console.log('ID:', id);
    console.log('Datos recibidos:', {
      examen: {
        url: examenData.url,
        titulo: examenData.titulo,
        publicado: examenData.publicado
      },
      horarios: examenData.horarios?.length || 0,
      extras: examenData.extras?.length || 0,
      faqs: examenData.faqs?.length || 0,
      muestras: examenData.muestras?.length || 0
    });

    // 1. Actualizar examen principal
    const { horarios, extras, faqs, muestras, ...examenBase } = examenData;
    console.log('Actualizando examen base...');
    const examen = await this.updateExamen(id, examenBase);
    console.log('Examen base actualizado');

    // 2. Actualizar relaciones - Eliminar todas las existentes y crear nuevas
    // Esto es más simple que hacer un diff y actualizar individualmente
    
    console.log('Eliminando relaciones existentes...');
    await Promise.all([
      supabase.from('examenes_horarios').delete().eq('id_examen', id),
      supabase.from('examenes_extras').delete().eq('id_examen', id),
      supabase.from('examenes_faq').delete().eq('id_examen', id),
      supabase.from('examenes_muestras').delete().eq('id_examen', id)
    ]);
    console.log('Relaciones existentes eliminadas');

    // 3. Crear nuevas relaciones en paralelo si existen
    const promises = [];

    if (horarios && horarios.length > 0) {
      console.log(`Creando ${horarios.length} horarios...`);
      promises.push(this.createMultipleHorarios(id, horarios));
    }

    if (extras && extras.length > 0) {
      console.log(`Creando ${extras.length} extras...`);
      promises.push(this.createMultipleExtras(id, extras));
    }

    if (faqs && faqs.length > 0) {
      console.log(`Creando ${faqs.length} faqs...`);
      promises.push(this.createMultipleFaqs(id, faqs));
    }

    if (muestras && muestras.length > 0) {
      console.log(`Creando ${muestras.length} muestras...`);
      promises.push(this.createMultipleMuestras(id, muestras));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      console.log('Nuevas relaciones creadas');
    }

    // 4. Retornar examen completo actualizado
    console.log('Obteniendo examen completo actualizado...');
    const examenCompleto = await this.getExamenCompleto(id);
    console.log('=== UPDATE EXAMEN COMPLETO TERMINADO ===');
    
    return examenCompleto as ExamenCompleto;

  } catch (error) {
    console.error('Error actualizando examen completo:', error);
    throw error;
  }
},

  // Eliminar examen (CON eliminación de archivos y relaciones)
  async deleteExamen(id: number): Promise<void> {
    try {
      // 1. Obtener el examen para conocer sus archivos
      const examen = await this.getExamenById(id);
      
      if (!examen) {
        throw new Error('Examen no encontrado');
      }

      // 2. Eliminar archivos del storage
      const filesToDelete: string[] = [];
      
      if (examen.imagen) {
        const imagePath = this.extractPathFromUrl(examen.imagen);
        if (imagePath) filesToDelete.push(imagePath);
      }

      // También buscar imágenes en contenido
      if (examen.contenido) {
        const contentImages = this.extractImagesFromContent(examen.contenido);
        filesToDelete.push(...contentImages);
      }

      if (examen.en_contenido) {
        const enContentImages = this.extractImagesFromContent(examen.en_contenido);
        filesToDelete.push(...enContentImages);
      }

      // Eliminar archivos del bucket
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.EXAMENES, filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo: ${filePath}`, error);
        }
      }

      // 3. Eliminar el registro (las relaciones se eliminan automáticamente por CASCADE)
      const { error } = await supabase
        .from('examenes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`Examen ${id} eliminado exitosamente con ${filesToDelete.length} archivos`);

    } catch (error) {
      console.error('Error eliminando examen:', error);
      throw error;
    }
  },

  // Cambiar estado publicado
  async togglePublished(id: number, publicado: boolean): Promise<void> {
    const { error } = await supabase
      .from('examenes')
      .update({ 
        publicado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // CRUD HORARIOS
  // =============================================

  // Obtener horarios por examen ID
  async getHorariosByExamenId(examenId: number): Promise<ExamenHorario[]> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .select('*')
      .eq('id_examen', examenId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Crear horario
  async createHorario(examenId: number, horarioData: any): Promise<ExamenHorario> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .insert([{ ...horarioData, id_examen: examenId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples horarios
  async createMultipleHorarios(examenId: number, horariosData: any[]): Promise<ExamenHorario[]> {
    const horariosToInsert = horariosData.map(horario => ({
      ...horario,
      id_examen: examenId
    }));

    const { data, error } = await supabase
      .from('examenes_horarios')
      .insert(horariosToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Actualizar horario
  async updateHorario(id: number, horarioData: any): Promise<ExamenHorario> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .update(horarioData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar horario
  async deleteHorario(id: number): Promise<void> {
    const { error } = await supabase
      .from('examenes_horarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // CRUD EXTRAS
  // =============================================

  // Obtener extras por examen ID
  async getExtrasByExamenId(examenId: number): Promise<ExamenExtra[]> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .select('*')
      .eq('id_examen', examenId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Crear extra
  async createExtra(examenId: number, extraData: any): Promise<ExamenExtra> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .insert([{ ...extraData, id_examen: examenId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples extras
  async createMultipleExtras(examenId: number, extrasData: any[]): Promise<ExamenExtra[]> {
    const extrasToInsert = extrasData.map(extra => ({
      ...extra,
      id_examen: examenId
    }));

    const { data, error } = await supabase
      .from('examenes_extras')
      .insert(extrasToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Actualizar extra
  async updateExtra(id: number, extraData: any): Promise<ExamenExtra> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .update(extraData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar extra
  async deleteExtra(id: number): Promise<void> {
    const { error } = await supabase
      .from('examenes_extras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // CRUD FAQ
  // =============================================

  // Obtener FAQs por examen ID
  async getFaqsByExamenId(examenId: number): Promise<ExamenFaq[]> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .select('*')
      .eq('id_examen', examenId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Crear FAQ
  async createFaq(examenId: number, faqData: any): Promise<ExamenFaq> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .insert([{ ...faqData, id_examen: examenId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples FAQs
  async createMultipleFaqs(examenId: number, faqsData: any[]): Promise<ExamenFaq[]> {
    const faqsToInsert = faqsData.map(faq => ({
      ...faq,
      id_examen: examenId
    }));

    const { data, error } = await supabase
      .from('examenes_faq')
      .insert(faqsToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Actualizar FAQ
  async updateFaq(id: number, faqData: any): Promise<ExamenFaq> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .update(faqData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar FAQ
  async deleteFaq(id: number): Promise<void> {
    const { error } = await supabase
      .from('examenes_faq')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // CRUD MUESTRAS
  // =============================================

  // Obtener muestras por examen ID
  async getMuestrasByExamenId(examenId: number): Promise<ExamenMuestra[]> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .select('*')
      .eq('id_examen', examenId)
      .order('seccion', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Crear muestra
  async createMuestra(examenId: number, muestraData: any): Promise<ExamenMuestra> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .insert([{ ...muestraData, id_examen: examenId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples muestras
  async createMultipleMuestras(examenId: number, muestrasData: any[]): Promise<ExamenMuestra[]> {
    const muestrasToInsert = muestrasData.map(muestra => ({
      ...muestra,
      id_examen: examenId
    }));

    const { data, error } = await supabase
      .from('examenes_muestras')
      .insert(muestrasToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Actualizar muestra
  async updateMuestra(id: number, muestraData: any): Promise<ExamenMuestra> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .update(muestraData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar muestra
  async deleteMuestra(id: number): Promise<void> {
    const { error } = await supabase
      .from('examenes_muestras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  // Generar URL slug a partir del título
  generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  // Validar que la URL sea única
  async validateUniqueUrl(url: string, excludeId?: number): Promise<boolean> {
    let query = supabase
      .from('examenes')
      .select('id')
      .eq('url', url);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  },

  // Buscar exámenes
  async searchExamenes(query: string): Promise<Examen[]> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%,contenido.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Extraer path de URL de Supabase
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      const publicIndex = pathParts.indexOf('public');
      const bucketIndex = publicIndex + 1;
      const filePathIndex = bucketIndex + 1;
      
      if (pathParts[bucketIndex] === STORAGE_BUCKETS.EXAMENES && filePathIndex < pathParts.length) {
        return pathParts.slice(filePathIndex).join('/');
      }
      
      return null;
    } catch (error) {
      console.warn('No se pudo extraer path de URL:', url, error);
      return null;
    }
  },

  // Extraer imágenes del contenido
  extractImagesFromContent(content: string): string[] {
    const images: string[] = [];
    
    const supabaseUrlRegex = /https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/examenes\/[^\s\)"\]>]+/g;
    const matches = content.match(supabaseUrlRegex);
    
    if (matches) {
      matches.forEach(url => {
        const path = this.extractPathFromUrl(url);
        if (path) images.push(path);
      });
    }
    
    return images;
  },

  // Obtener estadísticas
  async getStats(): Promise<ExamenStats> {
    try {
      const [examenes, horarios, extras, faqs, muestras] = await Promise.all([
        this.getExamenes(),
        supabase.from('examenes_horarios').select('id'),
        supabase.from('examenes_extras').select('id'),
        supabase.from('examenes_faq').select('id'),
        supabase.from('examenes_muestras').select('id')
      ]);

      const total = examenes.length;
      const publicados = examenes.filter(e => e.publicado).length;
      const borradores = total - publicados;

      const fechas = examenes
        .map(e => e.updated_at || e.created_at)
        .filter(Boolean)
        .sort()
        .reverse();

      const ultimaActualizacion = fechas.length > 0 ? fechas[0] : null;

      return {
        total,
        publicados,
        borradores,
        totalHorarios: horarios.data?.length || 0,
        totalExtras: extras.data?.length || 0,
        totalFaqs: faqs.data?.length || 0,
        totalMuestras: muestras.data?.length || 0,
        ultimaActualizacion
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};