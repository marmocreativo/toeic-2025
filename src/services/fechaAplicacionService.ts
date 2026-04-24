// src/services/fechaAplicacionService.ts

import { supabase } from '../lib/supabase';
import type { FechaAplicacion, FechaAplicacionFormData } from '../types/fechaAplicacion';

// ============ OBTENER ============

export const getFechasAplicaciones = async (idCentro?: number): Promise<FechaAplicacion[]> => {
  let query = supabase
    .from('fechas_aplicaciones_centros')
    .select(`
      *,
      centro:centros(id, nombre, clave)
    `)
    .order('orden', { ascending: true })
    .order('fecha', { ascending: true });

  if (idCentro) {
    query = query.eq('id_centro', idCentro);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fechas aplicaciones:', error);
    throw error;
  }

  return data || [];
};

export const getFechasAplicacionesByCentro = async (idCentro: number): Promise<FechaAplicacion[]> => {
  const { data, error } = await supabase
    .from('fechas_aplicaciones_centros')
    .select('*')
    .eq('id_centro', idCentro)
    .order('orden', { ascending: true })
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error fetching fechas by centro:', error);
    throw error;
  }

  return data || [];
};

export const getFechaAplicacion = async (id: number): Promise<FechaAplicacion | null> => {
  const { data, error } = await supabase
    .from('fechas_aplicaciones_centros')
    .select(`
      *,
      centro:centros(id, nombre, clave)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching fecha aplicacion:', error);
    throw error;
  }

  return data;
};

// Solo fechas publicadas (para la vista pública)
export const getFechasAplicacionesPublicas = async (idCentro?: number | null): Promise<FechaAplicacion[]> => {
  let query = supabase
    .from('fechas_aplicaciones_centros')
    .select(`
      *,
      centro:centros(id, nombre, clave)
    `)
    .eq('publicado', true)
    .order('orden', { ascending: true })
    .order('fecha', { ascending: true });

  if (idCentro !== undefined) {
    if (idCentro === null) {
      // Solo las generales (sin centro)
      query = query.is('id_centro', null);
    } else {
      // Las del centro específico + las generales
      query = query.or(`id_centro.eq.${idCentro},id_centro.is.null`);
    }
  }
  // Si idCentro es undefined, trae todas

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fechas públicas:', error);
    throw error;
  }

  return data || [];
};

// ============ CREAR ============

export const createFechaAplicacion = async (fechaData: FechaAplicacionFormData): Promise<FechaAplicacion> => {
  // Obtener siguiente orden
  let ordenQuery = supabase
    .from('fechas_aplicaciones_centros')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1);

    if (fechaData.id_centro) {
    ordenQuery = ordenQuery.eq('id_centro', fechaData.id_centro);
    }

    const { data: lastItem } = await ordenQuery;

  const nextOrden = lastItem && lastItem.length > 0 ? (lastItem[0].orden || 0) + 1 : 1;

  // Limpiar campos según el tipo
  const payload = buildPayload(fechaData, nextOrden);

  const { data, error } = await supabase
    .from('fechas_aplicaciones_centros')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating fecha aplicacion:', error);
    throw error;
  }

  return data;
};

// ============ ACTUALIZAR ============

export const updateFechaAplicacion = async (id: number, fechaData: FechaAplicacionFormData): Promise<FechaAplicacion> => {
  const payload = buildPayload(fechaData);

  const { data, error } = await supabase
    .from('fechas_aplicaciones_centros')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating fecha aplicacion:', error);
    throw error;
  }

  return data;
};

export const togglePublicadoFecha = async (id: number, publicado: boolean): Promise<FechaAplicacion> => {
  const { data, error } = await supabase
    .from('fechas_aplicaciones_centros')
    .update({ publicado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling publicado:', error);
    throw error;
  }

  return data;
};

// ============ ELIMINAR ============

export const deleteFechaAplicacion = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('fechas_aplicaciones_centros')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting fecha aplicacion:', error);
    throw error;
  }
};

export const deleteFechasByCentro = async (idCentro: number): Promise<void> => {
  const { error } = await supabase
    .from('fechas_aplicaciones_centros')
    .delete()
    .eq('id_centro', idCentro);

  if (error) {
    console.error('Error deleting fechas by centro:', error);
    throw error;
  }
};

// ============ HELPERS ============

// Limpia los campos según si es fecha específica o recurrente
const buildPayload = (fechaData: FechaAplicacionFormData, orden?: number) => {
  const esRecurrente = !!fechaData.tipo_recurrencia;

  return {
    id_centro: fechaData.id_centro,
    // Fecha específica
    fecha: esRecurrente ? null : (fechaData.fecha || null),
    // Recurrencia
    tipo_recurrencia: esRecurrente ? fechaData.tipo_recurrencia : null,
    dia_mes: esRecurrente && fechaData.tipo_recurrencia === 'dia_mes' ? fechaData.dia_mes ?? null : null,
    dia_semana: esRecurrente && fechaData.tipo_recurrencia !== 'dia_mes' ? fechaData.dia_semana ?? null : null,
    // Comunes
    hora: fechaData.hora && fechaData.hora.trim() !== '' ? fechaData.hora : null,
    notas: fechaData.notas && fechaData.notas.trim() !== '' ? fechaData.notas : null,
    publicado: fechaData.publicado ?? false,
    ...(orden !== undefined && { orden }),
  };
};

// Utilidad para mostrar la descripción legible de una regla de recurrencia
export const describeFechaAplicacion = (fecha: FechaAplicacion, lang: 'es' | 'en' = 'es'): string => {
  if (fecha.fecha) {
    return new Date(`${fecha.fecha}T00:00:00`).toLocaleDateString(
      lang === 'es' ? 'es-MX' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  }

  const diasEs = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const diasEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dias = lang === 'es' ? diasEs : diasEn;

  if (fecha.tipo_recurrencia === 'dia_mes') {
    return lang === 'es'
      ? `Todos los días ${fecha.dia_mes} del mes`
      : `Every ${fecha.dia_mes}th of the month`;
  }

  if (fecha.tipo_recurrencia === 'ultimo_dia_semana') {
    const dia = dias[fecha.dia_semana ?? 0];
    return lang === 'es'
      ? `Último ${dia} de cada mes`
      : `Last ${dia} of every month`;
  }

  if (fecha.tipo_recurrencia === 'primer_dia_semana') {
    const dia = dias[fecha.dia_semana ?? 0];
    return lang === 'es'
      ? `Primer ${dia} de cada mes`
      : `First ${dia} of every month`;
  }

  return '';
};