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
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Horarios de examen
export interface ExamenHorario {
  id: number;
  id_examen: number;
  dia: string | null;
  hora: string | null;
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
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

// Examen completo con todas sus relaciones
export interface ExamenCompleto extends Examen {
  horarios: ExamenHorario[];
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
  publicado?: boolean;
}

export interface ExamenHorarioFormData {
  dia?: string;
  hora?: string;
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
  publicado?: boolean;
}

export interface ExamenFaqFormData {
  pregunta?: string;
  respuesta?: string;
  en_pregunta?: string;
  en_respuesta?: string;
  publicado?: boolean;
}

export interface ExamenMuestraFormData {
  seccion?: string;
  pregunta?: string;
  publicado?: boolean;
}

// Formulario completo para crear/editar examen
export interface ExamenCompletoFormData extends ExamenFormData {
  horarios?: ExamenHorarioFormData[];
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
  totalExtras: number;
  totalFaqs: number;
  totalMuestras: number;
  ultimaActualizacion: string | null;
}