// src/types/examen.ts

// Tipo base para examen
export interface Examen {
  id: number;
  url: string;
  titulo: string | null;
  resumen: string | null;
  contenido: string | null;
  en_titulo: string | null;
  en_resumen: string | null;
  en_contenido: string | null;
  imagen: string | null;
  texto_fechas_especiales: string | null; // ← NUEVA COLUMNA
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Horarios de examen (regulares)
export interface ExamenHorario {
  id: number;
  id_examen: number;
  dia: string | null;
  hora: string | null;
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// ← NUEVA INTERFAZ: Fechas especiales del examen
export interface ExamenFechaEspecial {
  id: number;
  id_examen: number;
  fecha: string; // formato 'YYYY-MM-DD'
  hora: string;  // formato 'HH:MM'
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Información extra del examen
export interface ExamenExtra {
  id: number;
  id_examen: number;
  titulo: string | null;
  contenido: string | null;
  boton_texto: string | null;
  en_titulo: string | null;
  en_contenido: string | null;
  en_boton_texto: string | null;
  boton_enlace: string | null;
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// FAQ del examen
export interface ExamenFaq {
  id: number;
  id_examen: number;
  pregunta: string | null;
  respuesta: string | null;
  en_pregunta: string | null;
  en_respuesta: string | null;
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Muestras del examen
export interface ExamenMuestra {
  id: number;
  id_examen: number;
  seccion: string | null;
  pregunta: string | null;
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Examen completo con todas sus relaciones
export interface ExamenCompleto extends Examen {
  horarios: ExamenHorario[];
  fechas_especiales: ExamenFechaEspecial[]; // ← NUEVA RELACIÓN
  extras: ExamenExtra[];
  faqs: ExamenFaq[];
  muestras: ExamenMuestra[];
}

// Formularios de creación/edición
export interface ExamenFormData {
  url: string;
  titulo?: string;
  resumen?: string;
  contenido?: string;
  en_titulo?: string;
  en_resumen?: string;
  en_contenido?: string;
  imagen?: string;
  texto_fechas_especiales?: string; // ← NUEVO CAMPO
  publicado?: boolean;
}

export interface ExamenHorarioFormData {
  dia?: string;
  hora?: string;
  orden?: number;
  publicado?: boolean;
}

// ← NUEVO FORMULARIO: Para fechas especiales
export interface ExamenFechaEspecialFormData {
  fecha?: string; // formato 'YYYY-MM-DD'
  hora?: string;  // formato 'HH:MM'
  orden?: number;
  publicado?: boolean;
}

export interface ExamenExtraFormData {
  titulo?: string;
  contenido?: string;
  boton_texto?: string;
  en_titulo?: string;
  en_contenido?: string;
  en_boton_texto?: string;
  boton_enlace?: string;
  orden?: number;
  publicado?: boolean;
}

export interface ExamenFaqFormData {
  pregunta?: string;
  respuesta?: string;
  en_pregunta?: string;
  en_respuesta?: string;
  orden?: number;
  publicado?: boolean;
}

export interface ExamenMuestraFormData {
  seccion?: string;
  pregunta?: string;
  orden?: number;
  publicado?: boolean;
}

// Formulario completo para crear/editar examen
export interface ExamenCompletoFormData extends ExamenFormData {
  horarios?: ExamenHorarioFormData[];
  fechas_especiales?: ExamenFechaEspecialFormData[]; // ← NUEVA SECCIÓN
  extras?: ExamenExtraFormData[];
  faqs?: ExamenFaqFormData[];
  muestras?: ExamenMuestraFormData[];
}

// Estadísticas de exámenes
export interface ExamenStats {
  total: number;
  publicados: number;
  borradores: number;
  totalHorarios: number;
  totalFechasEspeciales: number; // ← NUEVA ESTADÍSTICA
  totalExtras: number;
  totalFaqs: number;
  totalMuestras: number;
  ultimaActualizacion: string | null;
}

// ========================================================================
// TIPOS PARA ORDENAMIENTO
// ========================================================================

// Tipos para reordenamiento
export interface ExamenOrderUpdate {
  id: number;
  orden: number;
}

export interface ReorderResult {
  success: boolean;
  updated: number;
  errors?: string[];
}

// Tipos para datos mínimos de ordenamiento
export interface ExamenHorarioForOrdering {
  id: number;
  dia: string | null;
  hora: string | null;
  orden: number;
  publicado: boolean;
}

// ← NUEVO TIPO: Para ordenamiento de fechas especiales
export interface ExamenFechaEspecialForOrdering {
  id: number;
  fecha: string;
  hora: string;
  orden: number;
  publicado: boolean;
}

export interface ExamenExtraForOrdering {
  id: number;
  titulo: string | null;
  orden: number;
  publicado: boolean;
}

export interface ExamenFaqForOrdering {
  id: number;
  pregunta: string | null;
  orden: number;
  publicado: boolean;
}

export interface ExamenMuestraForOrdering {
  id: number;
  seccion: string | null;
  pregunta: string | null;
  orden: number;
  publicado: boolean;
}

// ========================================================================
// NUEVOS TIPOS PARA FECHAS ESPECIALES
// ========================================================================

// Tipo para validación de fechas
export interface FechaEspecialValidation {
  valid: boolean;
  errors: string[];
}

// Tipo para filtros de fechas especiales
export interface FechaEspecialFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  publicado?: boolean;
}

// Tipo para respuesta de fechas especiales agrupadas
export interface FechasEspecialesGrouped {
  [examenId: number]: {
    examen: Pick<Examen, 'id' | 'titulo' | 'url'>;
    fechas: ExamenFechaEspecial[];
  };
}