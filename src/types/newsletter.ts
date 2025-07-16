// src/types/newsletter.ts

export interface Newsletter {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string; // formato YYYY-MM-DD
  archivo: string; // URL del archivo PDF
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterForm {
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  archivo: string;
  publicado: boolean;
}