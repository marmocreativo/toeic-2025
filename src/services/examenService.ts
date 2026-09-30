// src/services/examenService.ts
import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type {
  Examen,
  ExamenCompleto,
  ExamenFormData,
  ExamenHorario,
  ExamenFechaEspecial, // ← NUEVO IMPORT
  ExamenExtra,
  ExamenFaq,
  ExamenMuestra,
  ExamenStats,
  ExamenCompletoFormData,
  ReorderResult,
  ExamenHorarioForOrdering,
  ExamenFechaEspecialForOrdering, // ← NUEVO IMPORT
  ExamenExtraForOrdering,
  ExamenFaqForOrdering,
  ExamenMuestraForOrdering
} from '../types/examen';

export const examenService = {
  // =============================================
  // CRUD PRINCIPAL DE EXÁMENES
  // =============================================

  // Obtener todos los exámenes ORDENADOS
  async getExamenes(): Promise<Examen[]> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener exámenes publicados ORDENADOS (para frontend público)
  async getPublishedExamenes(): Promise<Examen[]> {
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('publicado', true)
      .order('orden', { ascending: true })
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

  // Obtener examen completo con todas sus relaciones ORDENADAS
  async getExamenCompleto(id: number): Promise<ExamenCompleto | null> {
    try {
      // Obtener examen principal
      const examen = await this.getExamenById(id);
      if (!examen) return null;

      // Obtener todas las relaciones en paralelo ORDENADAS
      const [horarios, fechasEspeciales, extras, faqs, muestras] = await Promise.all([
        this.getHorariosByExamenId(id),
        this.getFechasEspecialesByExamenId(id), // ← NUEVA CONSULTA
        this.getExtrasByExamenId(id),
        this.getFaqsByExamenId(id),
        this.getMuestrasByExamenId(id)
      ]);

      return {
        ...examen,
        horarios,
        fechas_especiales: fechasEspeciales, // ← NUEVA PROPIEDAD
        extras,
        faqs,
        muestras
      };
    } catch (error) {
      console.error('Error obteniendo examen completo:', error);
      throw error;
    }
  },

  // Crear nuevo examen CON ORDEN AUTOMÁTICO
  async createExamen(examenData: ExamenFormData): Promise<Examen> {
    const nextOrder = await this.getNextExamenOrder();
    
    const { data, error } = await supabase
      .from('examenes')
      .insert([{
        ...examenData,
        orden: nextOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear examen completo con todas sus relaciones CON ORDEN AUTOMÁTICO
  async createExamenCompleto(examenData: ExamenCompletoFormData): Promise<ExamenCompleto> {
    try {
      // 1. Crear examen principal
      const { horarios, fechas_especiales, extras, faqs, muestras, ...examenBase } = examenData;
      const examen = await this.createExamen(examenBase);

      // 2. Crear relaciones en paralelo con orden automático
      const promises = [];

      if (horarios && horarios.length > 0) {
        promises.push(this.createMultipleHorarios(examen.id, horarios));
      }

      if (fechas_especiales && fechas_especiales.length > 0) { // ← NUEVA SECCIÓN
        promises.push(this.createMultipleFechasEspeciales(examen.id, fechas_especiales));
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
    try {
      // Obtener contenido anterior para limpieza
      const existingExamen = await this.getExamenById(id);
      const oldContent = [
        existingExamen?.contenido || '',
        existingExamen?.en_contenido || ''
      ].join(' ');
      
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
      
      // Ejecutar limpieza de archivos huérfanos
      const newContent = [
        examenData.contenido || '',
        examenData.en_contenido || ''
      ].join(' ');
      
      // Importar StorageService dinámicamente para evitar dependencias circulares
      const { StorageService } = await import('./storageService');
      StorageService.handleContentUpdate(oldContent, newContent);
      
      return data;
    } catch (error) {
      console.error('Error actualizando examen:', error);
      throw error;
    }
  },

  // Actualizar examen completo con todas sus relaciones CON ORDEN PRESERVADO
  async updateExamenCompleto(id: number, examenData: ExamenCompletoFormData): Promise<ExamenCompleto> {
    try {
      console.log('=== INICIANDO UPDATE EXAMEN COMPLETO CON LIMPIEZA ===');
      
      // Obtener datos existentes para limpieza
      const existingExamen = await this.getExamenCompleto(id);
      let oldContent = '';
      
      if (existingExamen) {
        // Concatenar todo el contenido anterior
        oldContent = [
          existingExamen.contenido || '',
          existingExamen.en_contenido || '',
          existingExamen.requisitos || '', 
          existingExamen.en_requisitos || '', 
          ...(existingExamen.extras || []).map(e => `${e.contenido || ''} ${e.en_contenido || ''}`),
          ...(existingExamen.faqs || []).map(f => `${f.respuesta || ''} ${f.en_respuesta || ''}`),
          ...(existingExamen.muestras || []).map(m => m.pregunta || '')
        ].join(' ');
      }
      
      // 1. Actualizar examen principal
      const { horarios, fechas_especiales, extras, faqs, muestras, ...examenBase } = examenData;
      const examen = await this.updateExamen(id, examenBase);
      console.log(examen);
      
      // 2. Eliminar relaciones existentes
      await Promise.all([
        supabase.from('examenes_horarios').delete().eq('id_examen', id),
        supabase.from('examenes_fechas_especiales').delete().eq('id_examen', id), // ← NUEVA TABLA
        supabase.from('examenes_extras').delete().eq('id_examen', id),
        supabase.from('examenes_faq').delete().eq('id_examen', id),
        supabase.from('examenes_muestras').delete().eq('id_examen', id)
      ]);

      // 3. Crear nuevas relaciones CON ORDEN
      const promises = [];
      if (horarios && horarios.length > 0) {
        promises.push(this.createMultipleHorarios(id, horarios));
      }
      if (fechas_especiales && fechas_especiales.length > 0) { // ← NUEVA SECCIÓN
        promises.push(this.createMultipleFechasEspeciales(id, fechas_especiales));
      }
      if (extras && extras.length > 0) {
        promises.push(this.createMultipleExtras(id, extras));
      }
      if (faqs && faqs.length > 0) {
        promises.push(this.createMultipleFaqs(id, faqs));
      }
      if (muestras && muestras.length > 0) {
        promises.push(this.createMultipleMuestras(id, muestras));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // 4. Limpieza de archivos huérfanos
      const newContent = [
        examenData.contenido || '',
        examenData.en_contenido || '',
        ...(examenData.extras || []).map(e => `${e.contenido || ''} ${e.en_contenido || ''}`),
        ...(examenData.faqs || []).map(f => `${f.respuesta || ''} ${f.en_respuesta || ''}`),
        ...(examenData.muestras || []).map(m => m.pregunta || '')
      ].join(' ');
      
      // Ejecutar limpieza en background
      const { StorageService } = await import('./storageService');
      StorageService.handleContentUpdate(oldContent, newContent);
      
      // 5. Retornar examen completo actualizado
      const examenCompleto = await this.getExamenCompleto(id);
      console.log('=== UPDATE EXAMEN COMPLETO CON LIMPIEZA TERMINADO ===');
      
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
  // ORDENAMIENTO DE EXÁMENES PRINCIPALES
  // =============================================

  // Obtener próximo orden para exámenes
  async getNextExamenOrder(): Promise<number> {
    const { data, error } = await supabase
      .from('examenes')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Reordenar exámenes
  async reorderExamenes(orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) {
            errors.push(`Error actualizando examen ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando examen ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando exámenes:', error);
      throw error;
    }
  },

  // =============================================
  // CRUD HORARIOS CON ORDENAMIENTO
  // =============================================

  // Obtener horarios por examen ID ORDENADOS
  async getHorariosByExamenId(examenId: number): Promise<ExamenHorario[]> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .select('*')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener próximo orden para horarios
  async getNextHorarioOrder(examenId: number): Promise<number> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .select('orden')
      .eq('id_examen', examenId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Crear horario CON ORDEN AUTOMÁTICO
  async createHorario(examenId: number, horarioData: any): Promise<ExamenHorario> {
    const nextOrder = await this.getNextHorarioOrder(examenId);
    
    const { data, error } = await supabase
      .from('examenes_horarios')
      .insert([{ 
        ...horarioData, 
        id_examen: examenId,
        orden: horarioData.orden || nextOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples horarios CON ORDEN AUTOMÁTICO
  async createMultipleHorarios(examenId: number, horariosData: any[]): Promise<ExamenHorario[]> {
    const baseOrder = await this.getNextHorarioOrder(examenId);
    
    const horariosToInsert = horariosData.map((horario, index) => ({
      ...horario,
      id_examen: examenId,
      orden: horario.orden || (baseOrder + index)
    }));

    const { data, error } = await supabase
      .from('examenes_horarios')
      .insert(horariosToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Reordenar horarios
  async reorderHorarios(examenId: number, orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes_horarios')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('id_examen', examenId);

          if (error) {
            errors.push(`Error actualizando horario ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando horario ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando horarios:', error);
      throw error;
    }
  },

  // Obtener horarios para ordenamiento
  async getHorariosForOrdering(examenId: number): Promise<ExamenHorarioForOrdering[]> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .select('id, dia, hora, orden, publicado')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // =============================================
  // ← NUEVO: CRUD FECHAS ESPECIALES CON ORDENAMIENTO
  // =============================================

  // Obtener fechas especiales por examen ID ORDENADAS
  async getFechasEspecialesByExamenId(examenId: number): Promise<ExamenFechaEspecial[]> {
    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .select('*')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true })
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener próximo orden para fechas especiales
  async getNextFechaEspecialOrder(examenId: number): Promise<number> {
    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .select('orden')
      .eq('id_examen', examenId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Crear fecha especial CON ORDEN AUTOMÁTICO
  async createFechaEspecial(examenId: number, fechaData: any): Promise<ExamenFechaEspecial> {
    const nextOrder = await this.getNextFechaEspecialOrder(examenId);
    
    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .insert([{ 
        ...fechaData, 
        id_examen: examenId,
        orden: fechaData.orden || nextOrder,
        // ← NUEVA VALIDACIÓN: Convertir cadenas vacías en null para el campo hora
        hora: fechaData.hora && fechaData.hora.trim() !== '' ? fechaData.hora : null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples fechas especiales CON ORDEN AUTOMÁTICO
  async createMultipleFechasEspeciales(examenId: number, fechasData: any[]): Promise<ExamenFechaEspecial[]> {
    const baseOrder = await this.getNextFechaEspecialOrder(examenId);
    
    const fechasToInsert = fechasData.map((fecha, index) => ({
      ...fecha,
      id_examen: examenId,
      orden: fecha.orden || (baseOrder + index),
      // ← NUEVA VALIDACIÓN: Convertir cadenas vacías en null para el campo hora
      hora: fecha.hora && fecha.hora.trim() !== '' ? fecha.hora : null
    }));

    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .insert(fechasToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Reordenar fechas especiales
  async reorderFechasEspeciales(examenId: number, orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes_fechas_especiales')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('id_examen', examenId);

          if (error) {
            errors.push(`Error actualizando fecha especial ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando fecha especial ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando fechas especiales:', error);
      throw error;
    }
  },

  // Obtener fechas especiales para ordenamiento
  async getFechasEspecialesForOrdering(examenId: number): Promise<ExamenFechaEspecialForOrdering[]> {
    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .select('id, fecha, hora, orden, publicado')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Actualizar fecha especial
  async updateFechaEspecial(id: number, fechaData: any): Promise<ExamenFechaEspecial> {
    const { data, error } = await supabase
      .from('examenes_fechas_especiales')
      .update({
        ...fechaData,
        // ← NUEVA VALIDACIÓN: Convertir cadenas vacías en null para el campo hora
        hora: fechaData.hora && fechaData.hora.trim() !== '' ? fechaData.hora : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar fecha especial
  async deleteFechaEspecial(id: number): Promise<void> {
    const { error } = await supabase
      .from('examenes_fechas_especiales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =============================================
  // CRUD EXTRAS CON ORDENAMIENTO
  // =============================================

  // Obtener extras por examen ID ORDENADOS
  async getExtrasByExamenId(examenId: number): Promise<ExamenExtra[]> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .select('*')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener próximo orden para extras
  async getNextExtraOrder(examenId: number): Promise<number> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .select('orden')
      .eq('id_examen', examenId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Crear extra CON ORDEN AUTOMÁTICO
  async createExtra(examenId: number, extraData: any): Promise<ExamenExtra> {
    const nextOrder = await this.getNextExtraOrder(examenId);
    
    const { data, error } = await supabase
      .from('examenes_extras')
      .insert([{ 
        ...extraData, 
        id_examen: examenId,
        orden: extraData.orden || nextOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples extras CON ORDEN AUTOMÁTICO
  async createMultipleExtras(examenId: number, extrasData: any[]): Promise<ExamenExtra[]> {
    const baseOrder = await this.getNextExtraOrder(examenId);
    
    const extrasToInsert = extrasData.map((extra, index) => ({
      ...extra,
      id_examen: examenId,
      orden: extra.orden || (baseOrder + index)
    }));

    const { data, error } = await supabase
      .from('examenes_extras')
      .insert(extrasToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Reordenar extras
  async reorderExtras(examenId: number, orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes_extras')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('id_examen', examenId);

          if (error) {
            errors.push(`Error actualizando extra ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando extra ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando extras:', error);
      throw error;
    }
  },

  // Obtener extras para ordenamiento
  async getExtrasForOrdering(examenId: number): Promise<ExamenExtraForOrdering[]> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .select('id, titulo, orden, publicado')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // =============================================
  // CRUD FAQ CON ORDENAMIENTO
  // =============================================

  // Obtener FAQs por examen ID ORDENADOS
  async getFaqsByExamenId(examenId: number): Promise<ExamenFaq[]> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .select('*')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener próximo orden para FAQs
  async getNextFaqOrder(examenId: number): Promise<number> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .select('orden')
      .eq('id_examen', examenId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Crear FAQ CON ORDEN AUTOMÁTICO
  async createFaq(examenId: number, faqData: any): Promise<ExamenFaq> {
    const nextOrder = await this.getNextFaqOrder(examenId);
    
    const { data, error } = await supabase
      .from('examenes_faq')
      .insert([{ 
        ...faqData, 
        id_examen: examenId,
        orden: faqData.orden || nextOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples FAQs CON ORDEN AUTOMÁTICO
  async createMultipleFaqs(examenId: number, faqsData: any[]): Promise<ExamenFaq[]> {
    const baseOrder = await this.getNextFaqOrder(examenId);
    
    const faqsToInsert = faqsData.map((faq, index) => ({
      ...faq,
      id_examen: examenId,
      orden: faq.orden || (baseOrder + index)
    }));

    const { data, error } = await supabase
      .from('examenes_faq')
      .insert(faqsToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Reordenar FAQs
  async reorderFaqs(examenId: number, orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes_faq')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('id_examen', examenId);

          if (error) {
            errors.push(`Error actualizando FAQ ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando FAQ ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando FAQs:', error);
      throw error;
    }
  },

  // Obtener FAQs para ordenamiento
  async getFaqsForOrdering(examenId: number): Promise<ExamenFaqForOrdering[]> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .select('id, pregunta, orden, publicado')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // =============================================
  // CRUD MUESTRAS CON ORDENAMIENTO
  // =============================================

  // Obtener muestras por examen ID ORDENADOS
  async getMuestrasByExamenId(examenId: number): Promise<ExamenMuestra[]> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .select('*')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true })
      .order('seccion', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener próximo orden para muestras
  async getNextMuestraOrder(examenId: number): Promise<number> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .select('orden')
      .eq('id_examen', examenId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].orden || 0) + 1 : 1;
  },

  // Crear muestra CON ORDEN AUTOMÁTICO
  async createMuestra(examenId: number, muestraData: any): Promise<ExamenMuestra> {
    const nextOrder = await this.getNextMuestraOrder(examenId);
    
    const { data, error } = await supabase
      .from('examenes_muestras')
      .insert([{ 
        ...muestraData, 
        id_examen: examenId,
        orden: muestraData.orden || nextOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear múltiples muestras CON ORDEN AUTOMÁTICO
  async createMultipleMuestras(examenId: number, muestrasData: any[]): Promise<ExamenMuestra[]> {
    const baseOrder = await this.getNextMuestraOrder(examenId);
    
    const muestrasToInsert = muestrasData.map((muestra, index) => ({
      ...muestra,
      id_examen: examenId,
      orden: muestra.orden || (baseOrder + index)
    }));

    const { data, error } = await supabase
      .from('examenes_muestras')
      .insert(muestrasToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Reordenar muestras
  async reorderMuestras(examenId: number, orderedIds: number[]): Promise<ReorderResult> {
    try {
      const errors: string[] = [];
      let updated = 0;

      const updatePromises = orderedIds.map(async (id, index) => {
        try {
          const { error } = await supabase
            .from('examenes_muestras')
            .update({ 
              orden: index + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('id_examen', examenId);

          if (error) {
            errors.push(`Error actualizando muestra ${id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error actualizando muestra ${id}: ${err}`);
        }
      });

      await Promise.all(updatePromises);

      return {
        success: errors.length === 0,
        updated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error reordenando muestras:', error);
      throw error;
    }
  },

  // Obtener muestras para ordenamiento
  async getMuestrasForOrdering(examenId: number): Promise<ExamenMuestraForOrdering[]> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .select('id, seccion, pregunta, orden, publicado')
      .eq('id_examen', examenId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // =============================================
  // FUNCIONES DE ORDENAMIENTO LEGACY (mantener compatibilidad)
  // =============================================

  // Actualizar horario
  async updateHorario(id: number, horarioData: any): Promise<ExamenHorario> {
    const { data, error } = await supabase
      .from('examenes_horarios')
      .update({
        ...horarioData,
        updated_at: new Date().toISOString()
      })
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

  // Actualizar extra
  async updateExtra(id: number, extraData: any): Promise<ExamenExtra> {
    const { data, error } = await supabase
      .from('examenes_extras')
      .update({
        ...extraData,
        updated_at: new Date().toISOString()
      })
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

  // Actualizar FAQ
  async updateFaq(id: number, faqData: any): Promise<ExamenFaq> {
    const { data, error } = await supabase
      .from('examenes_faq')
      .update({
        ...faqData,
        updated_at: new Date().toISOString()
      })
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

  // Actualizar muestra
  async updateMuestra(id: number, muestraData: any): Promise<ExamenMuestra> {
    const { data, error } = await supabase
      .from('examenes_muestras')
      .update({
        ...muestraData,
        updated_at: new Date().toISOString()
      })
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

  // Extraer path de URL (toeic.mx/buckets/)
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      const bucketsIndex = pathParts.indexOf('buckets');
      const bucketIndex = bucketsIndex + 1;
      const filePathIndex = bucketIndex + 1;

      if (
        bucketsIndex !== -1 &&
        pathParts[bucketIndex] === STORAGE_BUCKETS.EXAMENES &&
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

  // Extraer imágenes del contenido
  extractImagesFromContent(content: string): string[] {
    const images: string[] = [];

    const storageUrlRegex = /https:\/\/[^\/]+\/buckets\/examenes\/[^\s\)"\]>]+/g;
    const matches = content.match(storageUrlRegex);

    if (matches) {
      matches.forEach(url => {
        const path = this.extractPathFromUrl(url);
        if (path) images.push(path);
      });
    }

    return images;
  },

  // Obtener estadísticas ACTUALIZADA
  async getStats(): Promise<ExamenStats> {
    try {
      const [examenes, horarios, fechasEspeciales, extras, faqs, muestras] = await Promise.all([
        this.getExamenes(),
        supabase.from('examenes_horarios').select('id'),
        supabase.from('examenes_fechas_especiales').select('id'), // ← NUEVA CONSULTA
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
        totalFechasEspeciales: fechasEspeciales.data?.length || 0, // ← NUEVA ESTADÍSTICA
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