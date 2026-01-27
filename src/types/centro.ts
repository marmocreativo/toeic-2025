// src/types/centro.ts

export interface CentroEstado {
  id: number;
  clave: string;
  nombre: string;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface CentroEstadoForm {
  clave: string;
  nombre: string;
  publicado: boolean;
}

export interface Centro {
  id: number;
  clave: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  telefono_alter: string;
  correo_alter: string;
  imagen: string;
  publicado: boolean;
  created_at: string;
  updated_at: string;
  // Relación con estado
  estado?: CentroEstado;
}

export interface CentroForm {
  clave: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  telefono_alter: string;
  correo_alter: string;
  imagen: string;
  publicado: boolean;
}

export interface CentroConEstado extends Centro {
  estado: CentroEstado;
}