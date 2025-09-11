// src/types/usuario.ts

export interface Usuario {
  id: string; // UUID de Supabase Auth
  email: string;
  email_confirmed_at: string | null;
  phone: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    nombre?: string;
    apellido?: string;
    avatar_url?: string;
    rol?: string;
  };
  aud: string;
  confirmation_sent_at: string | null;
  recovery_sent_at: string | null;
  email_change_sent_at: string | null;
  new_email: string | null;
  invited_at: string | null;
  action_link: string | null;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  role?: string;
}

export interface UsuarioFormData {
  email: string;
  password?: string; // Opcional para edición
  nombre?: string;
  apellido?: string;
  rol?: string;
  phone?: string;
}

export interface UsuarioCreateData {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
  phone?: string;
  email_confirm?: boolean; // Para confirmar email automáticamente
}

export interface UsuarioUpdateData {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
  phone?: string;
  email_confirm?: boolean;
  ban_duration?: string; // Para suspender usuarios
}

export interface UsuarioStats {
  total: number;
  confirmados: number;
  pendientes: number;
  activos: number; // Últimos 30 días
  ultimoRegistro: string | null;
}

export interface UsuarioFilters {
  search?: string;
  confirmado?: boolean;
  activo?: boolean; // Últimos 30 días
  desde?: string;
  hasta?: string;
}

// Estados de usuario
export interface UsuarioEstado {
  activo: boolean;
  confirmado: boolean;
  suspendido: boolean;
  ultimo_acceso: string | null;
}