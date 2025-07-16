import { supabase } from '../lib/supabase';
import { StorageService, STORAGE_BUCKETS } from './storageService';
import type { Pagina, PaginaFormData } from '../types/pagina';

export const paginaService = {
  // Obtener todas las páginas
  async getPaginas(): Promise<Pagina[]> {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener páginas publicadas (para frontend público)
  async getPublishedPaginas(): Promise<Pagina[]> {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener página por ID
  async getPaginaById(id: number): Promise<Pagina | null> {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Obtener página por URL
  async getPaginaByUrl(url: string): Promise<Pagina | null> {
    const { data, error } = await supabase
      .from('paginas')
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

  // Crear nueva página
  async createPagina(paginaData: PaginaFormData): Promise<Pagina> {
    const { data, error } = await supabase
      .from('paginas')
      .insert([paginaData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar página
  async updatePagina(id: number, paginaData: Partial<PaginaFormData>): Promise<Pagina> {
    const { data, error } = await supabase
      .from('paginas')
      .update({
        ...paginaData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar página (CON eliminación de archivos)
  async deletePagina(id: number): Promise<void> {
    try {
      // 1. Primero obtener la página para conocer sus archivos
      const pagina = await this.getPaginaById(id);
      
      if (!pagina) {
        throw new Error('Página no encontrada');
      }

      // 2. Eliminar archivos del storage
      const filesToDelete: string[] = [];
      
      // Extraer rutas de archivos de las URLs
      if (pagina.imagen) {
        const imagePath = this.extractPathFromUrl(pagina.imagen);
        if (imagePath) filesToDelete.push(imagePath);
      }

      // También buscar imágenes en el contenido (si usas URLs completas)
      if (pagina.contenido) {
        const contentImages = this.extractImagesFromContent(pagina.contenido);
        filesToDelete.push(...contentImages);
      }

      if (pagina.en_contenido) {
        const enContentImages = this.extractImagesFromContent(pagina.en_contenido);
        filesToDelete.push(...enContentImages);
      }

      // Eliminar archivos del bucket
      for (const filePath of filesToDelete) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.GENERAL, filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo: ${filePath}`, error);
          // Continuar aunque falle la eliminación del archivo
        }
      }

      // 3. Eliminar el registro de la base de datos
      const { error } = await supabase
        .from('paginas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`Página ${id} eliminada exitosamente con ${filesToDelete.length} archivos`);

    } catch (error) {
      console.error('Error eliminando página:', error);
      throw error;
    }
  },

  // Cambiar estado publicado
  async togglePublished(id: number, publicado: boolean): Promise<void> {
    const { error } = await supabase
      .from('paginas')
      .update({ 
        publicado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Generar URL slug a partir del título (mejorado)
  generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  },

  // Validar que la URL sea única
  async validateUniqueUrl(url: string, excludeId?: number): Promise<boolean> {
    let query = supabase
      .from('paginas')
      .select('id')
      .eq('url', url);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  },

  // Buscar páginas
  async searchPaginas(query: string): Promise<Pagina[]> {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%,contenido.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Función auxiliar para extraer el path del archivo desde la URL pública
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      const publicIndex = pathParts.indexOf('public');
      const bucketIndex = publicIndex + 1;
      const filePathIndex = bucketIndex + 1;
      
      if (pathParts[bucketIndex] === STORAGE_BUCKETS.GENERAL && filePathIndex < pathParts.length) {
        return pathParts.slice(filePathIndex).join('/');
      }
      
      return null;
    } catch (error) {
      console.warn('No se pudo extraer path de URL:', url, error);
      return null;
    }
  },

  // Extraer imágenes del contenido HTML/Markdown
  extractImagesFromContent(content: string): string[] {
    const images: string[] = [];
    
    // Buscar URLs de Supabase en el contenido
    const supabaseUrlRegex = /https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/general\/[^\s\)"\]>]+/g;
    const matches = content.match(supabaseUrlRegex);
    
    if (matches) {
      matches.forEach(url => {
        const path = this.extractPathFromUrl(url);
        if (path) images.push(path);
      });
    }
    
    return images;
  },

  // Limpiar archivos huérfanos en el bucket general
  async cleanOrphanedFiles(): Promise<{
    filesInStorage: number;
    filesInDatabase: number;
    orphanedFiles: string[];
    cleanedFiles: string[];
  }> {
    try {
      // 1. Obtener todos los archivos en el bucket general
      const filesInStorage = await StorageService.listFiles(STORAGE_BUCKETS.GENERAL);
      
      // 2. Obtener todas las URLs de imágenes en la base de datos
      const { data: paginas, error } = await supabase
        .from('paginas')
        .select('imagen, contenido, en_contenido');
      
      if (error) throw error;
      
      // 3. Extraer paths de las URLs en la base de datos
      const pathsInDatabase = new Set<string>();
      
      paginas?.forEach(pagina => {
        if (pagina.imagen) {
          const path = this.extractPathFromUrl(pagina.imagen);
          if (path) pathsInDatabase.add(path);
        }
        
        if (pagina.contenido) {
          const contentImages = this.extractImagesFromContent(pagina.contenido);
          contentImages.forEach(path => pathsInDatabase.add(path));
        }
        
        if (pagina.en_contenido) {
          const enContentImages = this.extractImagesFromContent(pagina.en_contenido);
          enContentImages.forEach(path => pathsInDatabase.add(path));
        }
      });
      
      // 4. Encontrar archivos huérfanos
      const orphanedFiles = filesInStorage
        .map(file => file.name)
        .filter(fileName => !pathsInDatabase.has(fileName));
      
      const cleanedFiles: string[] = [];
      
      /* DESCOMENTAR PARA ACTIVAR LIMPIEZA AUTOMÁTICA
      for (const orphanedFile of orphanedFiles) {
        try {
          await StorageService.deleteFile(STORAGE_BUCKETS.GENERAL, orphanedFile);
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

  // Estadísticas de páginas
  async getStats(): Promise<{
    total: number;
    publicadas: number;
    borradores: number;
    ultimaActualizacion: string | null;
  }> {
    try {
      const paginas = await this.getPaginas();
      
      const total = paginas.length;
      const publicadas = paginas.filter(p => p.publicado).length;
      const borradores = total - publicadas;
      
      // Encontrar la última actualización
      const fechas = paginas
        .map(p => p.updated_at || p.created_at)
        .filter(Boolean)
        .sort()
        .reverse();
      
      const ultimaActualizacion = fechas.length > 0 ? fechas[0] : null;
      
      return {
        total,
        publicadas,
        borradores,
        ultimaActualizacion
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};