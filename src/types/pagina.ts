export interface Pagina {
  id: number;
  titulo: string | null;
  resumen: string | null;
  contenido: string | null;
  en_titulo: string | null;
  en_resumen: string | null;
  en_contenido: string | null;
  imagen: string | null;
  url: string | null;
  en_url: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginaFormData {
  titulo: string;
  resumen: string;
  contenido: string;
  en_titulo: string;
  en_resumen: string;
  en_contenido: string;
  imagen: string;
  url: string;
  en_url: string;
  publicado: boolean;
}