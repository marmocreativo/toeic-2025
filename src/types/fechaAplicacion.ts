// src/types/fechaAplicacion.ts

export type TipoRecurrencia = 'dia_mes' | 'ultimo_dia_semana' | 'primer_dia_semana';

export interface FechaAplicacion {
  id: number;
  id_centro: number | null;
  fecha: string | null;           // formato 'YYYY-MM-DD', null si es recurrente
  tipo_recurrencia: TipoRecurrencia | null; // null si es fecha específica
  dia_mes: number | null;         // 1-31, usado con tipo_recurrencia='dia_mes'
  dia_semana: number | null;      // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  hora: string | null;            // formato 'HH:MM'
  notas: string | null;
  publicado: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  // Relación con centro
  centro?: {
    id: number;
    nombre: string;
    clave: string;
  };
}

export interface FechaAplicacionForm {
  id_centro: number | null;
  fecha: string | null;
  tipo_recurrencia: TipoRecurrencia | null;
  dia_mes: number | null;
  dia_semana: number | null;
  hora: string | null;
  notas: string | null;
  publicado: boolean;
  orden: number;
}

export interface FechaAplicacionFormData {
  id_centro: number | null;
  fecha?: string;
  tipo_recurrencia?: TipoRecurrencia;
  dia_mes?: number;
  dia_semana?: number;
  hora?: string;
  notas?: string;
  publicado?: boolean;
  orden?: number;
}