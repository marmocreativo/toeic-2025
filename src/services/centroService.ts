// src/services/centroService.ts

import { supabase } from '../lib/supabase';
import type { Centro, CentroForm, CentroEstado, CentroEstadoForm, CentroConEstado } from '../types/centro';
import { StorageService, STORAGE_BUCKETS } from './storageService';

// ============ FUNCIONES PARA MANEJO DE IMÁGENES ============

// Subir imagen del centro
export const uploadCentroImage = async (file: File, centroId?: number): Promise<string> => {
  console.log(centroId);
  try {
    // Validar archivo
    const validation = StorageService.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generar nombre único
    const fileName = StorageService.generateFileName(file.name, 'centro');
    const filePath = `centros/${fileName}`;

    // Subir archivo
    const url = await StorageService.uploadFile(STORAGE_BUCKETS.CENTROS, filePath, file);
    
    console.log('Imagen de centro subida exitosamente:', url);
    return url;
  } catch (error) {
    console.error('Error subiendo imagen del centro:', error);
    throw error;
  }
};

// Eliminar imagen anterior del centro
export const deleteOldCentroImage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl || !StorageService.isSupabaseStorageUrl(imageUrl)) {
      return; // No es una URL de Supabase o está vacía
    }

    const filePath = StorageService.extractFilePathFromUrl(imageUrl);
    if (filePath) {
      await StorageService.deleteFile(STORAGE_BUCKETS.CENTROS, filePath);
      console.log('Imagen anterior eliminada:', filePath);
    }
  } catch (error) {
    console.warn('No se pudo eliminar la imagen anterior:', error);
    // No lanzar error, es solo una limpieza
  }
};

// Función auxiliar para verificar si una URL es de Supabase Storage
const isSupabaseStorageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/storage/v1/object/public/');
  } catch (error) {
    return false;
  }
};

// Extraer path del archivo desde URL pública
/* comentado para que no genere error por no uso
const extractPathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    const publicIndex = pathParts.indexOf('public');
    const bucketIndex = publicIndex + 1;
    const filePathIndex = bucketIndex + 1;
    
    if (pathParts[bucketIndex] === STORAGE_BUCKETS.CENTROS && filePathIndex < pathParts.length) {
      return pathParts.slice(filePathIndex).join('/');
    }
    
    return null;
  } catch (error) {
    console.warn('No se pudo extraer path de URL:', url, error);
    return null;
  }
};
*/

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
  try {
    // Obtener centro actual para comparar imágenes
    const centroActual = await getCentro(id);
    
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

    // Si la imagen cambió, eliminar la anterior
    if (centroActual && 
        centroActual.imagen && 
        centroData.imagen !== centroActual.imagen &&
        isSupabaseStorageUrl(centroActual.imagen)) {
      
      await deleteOldCentroImage(centroActual.imagen);
    }

    return data;
  } catch (error) {
    console.error('Error updating centro:', error);
    throw error;
  }
};

export const deleteCentro = async (id: number): Promise<void> => {
  try {
    // Obtener el centro para conocer su imagen
    const centro = await getCentro(id);
    
    const { error } = await supabase
      .from('centros')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting centro:', error);
      throw error;
    }

    // Eliminar imagen si existe y es de Supabase
    if (centro && centro.imagen && isSupabaseStorageUrl(centro.imagen)) {
      await deleteOldCentroImage(centro.imagen);
    }

  } catch (error) {
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

// Método para crear múltiples estados (importación masiva)
export const createMultipleCentrosEstados = async (estados: CentroEstadoForm[]): Promise<CentroEstado[]> => {
  try {
    const resultados: CentroEstado[] = [];
    
    for (const estado of estados) {
      try {
        const nuevoEstado = await createCentroEstado(estado);
        resultados.push(nuevoEstado);
      } catch (error) {
        console.error('Error creando estado:', estado, error);
        throw error;
      }
    }
    
    return resultados;
  } catch (error) {
    console.error('Error en createMultipleCentrosEstados:', error);
    throw error;
  }
};

// Método para validar si un estado ya existe por clave
export const checkEstadoExists = async (clave: string): Promise<boolean> => {
  try {
    const estados = await getCentrosEstados();
    return estados.some(estado => estado.clave.toLowerCase() === clave.toLowerCase());
  } catch (error) {
    console.error('Error verificando existencia de estado:', error);
    return false;
  }
};

// Método para limpiar y normalizar datos de estado
export const normalizeEstadoData = (clave: string, nombre: string): { clave: string; nombre: string } => {
  return {
    clave: clave.toUpperCase().trim(),
    nombre: nombre.trim()
  };
};

// ============ IMPORTACIÓN CSV DE CENTROS ============

// Interfaces para importación CSV
export interface CentroCSVRow {
  CENTRO_CLAVE_ESTADO: string;
  CENTRO_NOMBRE: string;
  CENTRO_DIRECCION: string;
  CENTRO_TELEFONO: string;
  CENTRO_CORREO: string;
  CENTRO_IMAGEN: string;
}

export interface ImportResult {
  total: number;
  exitosos: number;
  errores: number;
  duplicados: number;
  detalles: ImportDetail[];
}

export interface ImportDetail {
  fila: number;
  nombre: string;
  estado: 'exitoso' | 'error' | 'duplicado';
  mensaje: string;
}

// Función principal de importación
export const importarCentrosCSV = async (csvData: CentroCSVRow[]): Promise<ImportResult> => {
  const resultado: ImportResult = {
    total: csvData.length,
    exitosos: 0,
    errores: 0,
    duplicados: 0,
    detalles: []
  };

  for (let i = 0; i < csvData.length; i++) {
    const fila = csvData[i];
    const numeroFila = i + 2; // +2 porque empezamos en fila 2 (después del header)

    try {
      // Validar campos requeridos
      if (!fila.CENTRO_CLAVE_ESTADO || !fila.CENTRO_NOMBRE) {
        resultado.errores++;
        resultado.detalles.push({
          fila: numeroFila,
          nombre: fila.CENTRO_NOMBRE || 'Sin nombre',
          estado: 'error',
          mensaje: 'Campos obligatorios faltantes (CENTRO_CLAVE_ESTADO, CENTRO_NOMBRE)'
        });
        continue;
      }

      // Verificar si el centro ya existe
      const centroExistente = await verificarCentroExistente(
        fila.CENTRO_CLAVE_ESTADO, 
        fila.CENTRO_NOMBRE
      );

      if (centroExistente) {
        resultado.duplicados++;
        resultado.detalles.push({
          fila: numeroFila,
          nombre: fila.CENTRO_NOMBRE,
          estado: 'duplicado',
          mensaje: 'Centro ya existe en la base de datos'
        });
        continue;
      }

      // Verificar que el estado existe
      const estadoExiste = await verificarEstadoExiste(fila.CENTRO_CLAVE_ESTADO);
      if (!estadoExiste) {
        resultado.errores++;
        resultado.detalles.push({
          fila: numeroFila,
          nombre: fila.CENTRO_NOMBRE,
          estado: 'error',
          mensaje: `Estado '${fila.CENTRO_CLAVE_ESTADO}' no existe`
        });
        continue;
      }

      // Procesar imagen si existe
      let imagenPath = null;
      if (fila.CENTRO_IMAGEN && fila.CENTRO_IMAGEN.trim() !== '') {
        imagenPath = `/images/centros/${fila.CENTRO_IMAGEN.trim()}`;
        
        // Verificar si el archivo existe (opcional)
        const imagenExiste = await verificarImagenExiste(fila.CENTRO_IMAGEN.trim());
        if (!imagenExiste) {
          // No es un error crítico, solo un warning
          resultado.detalles.push({
            fila: numeroFila,
            nombre: fila.CENTRO_NOMBRE,
            estado: 'exitoso',
            mensaje: `Centro creado exitosamente (advertencia: imagen '${fila.CENTRO_IMAGEN}' no encontrada)`
          });
        }
      }

      // Crear el centro
      const nuevoCentro: CentroForm = {
        clave: fila.CENTRO_CLAVE_ESTADO.trim(),
        nombre: fila.CENTRO_NOMBRE.trim(),
        direccion: fila.CENTRO_DIRECCION?.trim() || '',
        telefono: fila.CENTRO_TELEFONO?.trim() || '',
        correo: fila.CENTRO_CORREO?.trim() || '',
        imagen: imagenPath || '',
        publicado: false // Por defecto como borrador
      };

      await createCentro(nuevoCentro);
      resultado.exitosos++;
      
      // Solo agregar detalle si no hay uno previo (para evitar duplicar el warning de imagen)
      if (!resultado.detalles.find(d => d.fila === numeroFila)) {
        resultado.detalles.push({
          fila: numeroFila,
          nombre: fila.CENTRO_NOMBRE,
          estado: 'exitoso',
          mensaje: 'Centro creado exitosamente'
        });
      }

    } catch (error) {
      resultado.errores++;
      resultado.detalles.push({
        fila: numeroFila,
        nombre: fila.CENTRO_NOMBRE || 'Sin nombre',
        estado: 'error',
        mensaje: `Error al procesar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    }
  }

  return resultado;
};

// Funciones auxiliares para importación
const verificarCentroExistente = async (clave: string, nombre: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('centros')
      .select('id')
      .eq('clave', clave)
      .ilike('nombre', nombre);

    if (error) {
      console.error('Error al verificar centro existente:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error al verificar centro existente:', error);
    return false;
  }
};

const verificarEstadoExiste = async (clave: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('centros_estados')
      .select('clave')
      .eq('clave', clave)
      .single();

    if (error) {
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('Error al verificar estado:', error);
    return false;
  }
};

const verificarImagenExiste = async (nombreArchivo: string): Promise<boolean> => {
  try {
    const response = await fetch(`/images/centros/${nombreArchivo}`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Generar CSV de ejemplo
export const generarCSVEjemplo = (): string => {
  const headers = [
    'CENTRO_CLAVE_ESTADO',
    'CENTRO_NOMBRE',
    'CENTRO_DIRECCION',
    'CENTRO_TELEFONO',
    'CENTRO_CORREO',
    'CENTRO_IMAGEN'
  ];

  const ejemplos = [
    [
      'CDMX',
      'Centro TOEIC Ciudad de México Norte',
      'Av. Insurgentes Norte 123, Col. Roma Norte, 06700 Ciudad de México',
      '+52 55 1234 5678',
      'cdmx.norte@toeic.mx',
      'centro-cdmx-norte.jpg'
    ],
    [
      'JAL',
      'Centro TOEIC Guadalajara Centro',
      'Calle Morelos 456, Col. Centro, 44100 Guadalajara, Jalisco',
      '+52 33 2345 6789',
      'gdl.centro@toeic.mx',
      'centro-gdl-centro.jpg'
    ],
    [
      'NL',
      'Centro TOEIC Monterrey San Pedro',
      'Ave. Vasconcelos 789, Col. San Pedro, 66260 Monterrey, Nuevo León',
      '+52 81 3456 7890',
      'mty.sanpedro@toeic.mx',
      'centro-mty-sanpedro.jpg'
    ]
  ];

  const csvContent = [headers, ...ejemplos]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};

// ============ FUNCIÓN PARA PUBLICAR TODOS LOS CENTROS ============

export const publicarTodosCentros = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('centros')
      .update({ publicado: true })
      .eq('publicado', false);
      console.log(data);

    if (error) {
      console.error('Error al publicar todos los centros:', error);
      throw error;
    }

    console.log('Centros publicados exitosamente');
  } catch (error) {
    console.error('Error en publicarTodosCentros:', error);
    throw error;
  }
};

// Función para despublicar todos los centros (útil para testing)
export const despublicarTodosCentros = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('centros')
      .update({ publicado: false })
      .eq('publicado', true);
      console.log(data);

    if (error) {
      console.error('Error al despublicar todos los centros:', error);
      throw error;
    }

    console.log('Centros despublicados exitosamente');
  } catch (error) {
    console.error('Error en despublicarTodosCentros:', error);
    throw error;
  }
};