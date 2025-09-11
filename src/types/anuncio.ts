// src/types/anuncio.ts

export interface Anuncio {
  id: number;
  img_es: string | null;
  img_en: string | null;
  titulo_es: string | null;
  titulo_en: string | null;
  link: string | null;
  start_date: string; // formato YYYY-MM-DD
  end_date: string;   // formato YYYY-MM-DD
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnuncioFormData {
  img_es: string;
  img_en: string;
  titulo_es: string;
  titulo_en: string;
  link: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface AnuncioCreateData {
  img_es?: string;
  img_en?: string;
  titulo_es?: string;
  titulo_en?: string;
  link?: string;
  start_date: string;
  end_date: string;
  active?: boolean;
}

export interface AnuncioUpdateData {
  img_es?: string;
  img_en?: string;
  titulo_es?: string;
  titulo_en?: string;
  link?: string;
  start_date?: string;
  end_date?: string;
  active?: boolean;
}

export interface AnuncioFilters {
  active?: boolean;
  search?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface AnuncioStats {
  total: number;
  activos: number;
  inactivos: number;
  vigentes: number; // Activos y dentro del rango de fechas
  programados: number; // Activos pero con start_date futura
  expirados: number; // Activos pero con end_date pasada
}

// Para el componente público
export interface AnuncioActivo {
  id: number;
  imagen: string; // URL de la imagen según el idioma
  titulo: string; // Título según el idioma
  link: string | null;
}