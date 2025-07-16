// src/services/centroService.ts

import { supabase } from '../lib/supabase';
import type { Centro, CentroForm, CentroEstado, CentroEstadoForm, CentroConEstado } from '../types/centro';

// ============ CENTROS ESTADOS ============

export const getCentrosEstados = async (): Promise<CentroEstado[]> => {
  const { data, error } = await supabase
    .from('centros_estados')
    .select('*')
    .order('nombre');

  if (error) {
    console.error('Error fetching estados:', error);
    throw error;
  }

  return data || [];
};

export const getCentroEstado = async (id: number): Promise<CentroEstado | null> => {
  const { data, error } = await supabase
    .from('centros_estados')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching estado:', error);
    throw error;
  }

  return data;
};

export const createCentroEstado = async (estadoData: CentroEstadoForm): Promise<CentroEstado> => {
  const { data, error } = await supabase
    .from('centros_estados')
    .insert([estadoData])
    .select()
    .single();

  if (error) {
    console.error('Error creating estado:', error);
    throw error;
  }

  return data;
};

export const updateCentroEstado = async (id: number, estadoData: CentroEstadoForm): Promise<CentroEstado> => {
  const { data, error } = await supabase
    .from('centros_estados')
    .update(estadoData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating estado:', error);
    throw error;
  }

  return data;
};

export const deleteCentroEstado = async (id: number): Promise<void> => {
  // Primero verificar si hay centros usando este estado
  const { data: centros, error: centrosError } = await supabase
    .from('centros')
    .select('id')
    .eq('clave', id);

  if (centrosError) {
    console.error('Error checking centros:', centrosError);
    throw centrosError;
  }

  if (centros && centros.length > 0) {
    throw new Error('No se puede eliminar el estado porque tiene centros asociados');
  }

  const { error } = await supabase
    .from('centros_estados')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting estado:', error);
    throw error;
  }
};

// ============ CENTROS ============

export const getCentros = async (search?: string): Promise<CentroConEstado[]> => {
  let query = supabase
    .from('centros')
    .select(`
      *,
      estado:centros_estados(*)
    `)
    .order('nombre');

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,direccion.ilike.%${search}%,telefono.ilike.%${search}%,correo.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching centros:', error);
    throw error;
  }

  return data || [];
};

export const getCentro = async (id: number): Promise<CentroConEstado | null> => {
  const { data, error } = await supabase
    .from('centros')
    .select(`
      *,
      estado:centros_estados(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching centro:', error);
    throw error;
  }

  return data;
};

export const createCentro = async (centroData: CentroForm): Promise<Centro> => {
  const { data, error } = await supabase
    .from('centros')
    .insert([centroData])
    .select()
    .single();

  if (error) {
    console.error('Error creating centro:', error);
    throw error;
  }

  return data;
};

export const updateCentro = async (id: number, centroData: CentroForm): Promise<Centro> => {
  const { data, error } = await supabase
    .from('centros')
    .update(centroData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating centro:', error);
    throw error;
  }

  return data;
};

export const deleteCentro = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('centros')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting centro:', error);
    throw error;
  }
};

// ============ FUNCIONES AUXILIARES ============

export const getCentrosPorEstado = async (claveEstado: string): Promise<Centro[]> => {
  const { data, error } = await supabase
    .from('centros')
    .select('*')
    .eq('clave', claveEstado)
    .eq('publicado', true)
    .order('nombre');

  if (error) {
    console.error('Error fetching centros por estado:', error);
    throw error;
  }

  return data || [];
};

export const getEstadisticasCentros = async () => {
  const { data: centros, error: centrosError } = await supabase
    .from('centros')
    .select('publicado');

  const { data: estados, error: estadosError } = await supabase
    .from('centros_estados')
    .select('publicado');

  if (centrosError || estadosError) {
    console.error('Error fetching estadísticas:', centrosError || estadosError);
    throw centrosError || estadosError;
  }

  const centrosPublicados = centros?.filter(c => c.publicado).length || 0;
  const centrosTotal = centros?.length || 0;
  const estadosPublicados = estados?.filter(e => e.publicado).length || 0;
  const estadosTotal = estados?.length || 0;

  return {
    centros: {
      total: centrosTotal,
      publicados: centrosPublicados,
      borradores: centrosTotal - centrosPublicados
    },
    estados: {
      total: estadosTotal,
      publicados: estadosPublicados,
      borradores: estadosTotal - estadosPublicados
    }
  };
};