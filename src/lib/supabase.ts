// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-clave-anonima'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript (opcional pero recomendado)
export type Database = {
  public: {
    Tables: {
      sliders: {
        Row: {
          id: number
          titulo: string | null
          subtitulo: string | null
          extra: string | null
          boton_texto: string | null
          boton_enlace: string | null
          en_titulo: string | null
          en_subtitulo: string | null
          en_extra: string | null
          en_boton_texto: string | null
          imagen: string | null
          logo: string | null
          publicado: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          titulo?: string | null
          subtitulo?: string | null
          extra?: string | null
          boton_texto?: string | null
          boton_enlace?: string | null
          en_titulo?: string | null
          en_subtitulo?: string | null
          en_extra?: string | null
          en_boton_texto?: string | null
          imagen?: string | null
          logo?: string | null
          publicado?: boolean | null
        }
        Update: {
          titulo?: string | null
          subtitulo?: string | null
          extra?: string | null
          boton_texto?: string | null
          boton_enlace?: string | null
          en_titulo?: string | null
          en_subtitulo?: string | null
          en_extra?: string | null
          en_boton_texto?: string | null
          imagen?: string | null
          logo?: string | null
          publicado?: boolean | null
        }
      }
      examenes: {
        Row: {
          id: number
          url: string
          titulo: string | null
          resumen: string | null
          contenido: string | null
          en_titulo: string | null
          en_resumen: string | null
          en_contenido: string | null
          imagen: string | null
          publicado: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          url: string
          titulo?: string | null
          resumen?: string | null
          contenido?: string | null
          en_titulo?: string | null
          en_resumen?: string | null
          en_contenido?: string | null
          imagen?: string | null
          publicado?: boolean | null
        }
        Update: {
          url?: string
          titulo?: string | null
          resumen?: string | null
          contenido?: string | null
          en_titulo?: string | null
          en_resumen?: string | null
          en_contenido?: string | null
          imagen?: string | null
          publicado?: boolean | null
        }
      }
      // Agregar más tipos de tablas según necesites
    }
  }
}