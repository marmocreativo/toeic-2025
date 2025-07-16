export interface Slider {
  id: number;
  titulo: string | null;
  subtitulo: string | null;
  extra: string | null;
  boton_texto: string | null;
  boton_enlace: string | null;
  en_titulo: string | null;
  en_subtitulo: string | null;
  en_extra: string | null;
  en_boton_texto: string | null;
  imagen: string | null;
  logo: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface SliderFormData {
  titulo: string;
  subtitulo: string;
  extra: string;
  boton_texto: string;
  boton_enlace: string;
  en_titulo: string;
  en_subtitulo: string;
  en_extra: string;
  en_boton_texto: string;
  imagen: string;
  logo: string;
  publicado: boolean;
}