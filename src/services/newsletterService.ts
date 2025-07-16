// src/services/newsletterService.ts

import { supabase } from '../lib/supabase';
import type { Newsletter, NewsletterForm } from '../types/newsletter';
import { StorageService } from './storageService';

export const getNewsletters = async (search?: string): Promise<Newsletter[]> => {
  let query = supabase
    .from('newsletters')
    .select('*')
    .order('fecha_publicacion', { ascending: false });

  if (search) {
    query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching newsletters:', error);
    throw error;
  }

  return data || [];
};

export const getNewsletter = async (id: number): Promise<Newsletter | null> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching newsletter:', error);
    throw error;
  }

  return data;
};

export const createNewsletter = async (newsletterData: NewsletterForm): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .insert([newsletterData])
    .select()
    .single();

  if (error) {
    console.error('Error creating newsletter:', error);
    throw error;
  }

  return data;
};

export const updateNewsletter = async (id: number, newsletterData: NewsletterForm): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .update({
      ...newsletterData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating newsletter:', error);
    throw error;
  }

  return data;
};

export const deleteNewsletter = async (id: number): Promise<void> => {
  // Primero obtenemos el newsletter para saber qué archivo eliminar
  const { data: newsletter, error: fetchError } = await supabase
    .from('newsletters')
    .select('archivo')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching newsletter for deletion:', fetchError);
    throw fetchError;
  }

  // Eliminamos el archivo si existe
  if (newsletter?.archivo) {
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(newsletter.archivo);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      await StorageService.deleteFile('general', fileName);
    } catch (fileError) {
      console.warn('Error eliminando archivo del newsletter:', fileError);
      // Continuamos aunque falle la eliminación del archivo
    }
  }

  // Eliminamos el registro de la base de datos
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting newsletter:', error);
    throw error;
  }
};

export const getEstadisticasNewsletters = async () => {
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('publicado, fecha_publicacion');

  if (error) {
    console.error('Error fetching newsletter stats:', error);
    throw error;
  }

  const total = newsletters?.length || 0;
  const publicados = newsletters?.filter(n => n.publicado).length || 0;
  const borradores = total - publicados;

  // Estadísticas por mes (últimos 6 meses)
  const ahora = new Date();
  const seismesesAtras = new Date();
  seismesesAtras.setMonth(ahora.getMonth() - 6);

  const newslettersRecientes = newsletters?.filter(n => {
    const fecha = new Date(n.fecha_publicacion);
    return fecha >= seismesesAtras;
  }) || [];

  return {
    total,
    publicados,
    borradores,
    recientes: newslettersRecientes.length
  };
};