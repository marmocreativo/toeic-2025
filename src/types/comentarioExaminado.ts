// src/types/comentarioExaminado.ts

export type Idioma = 'es' | 'en';

// ============================================================================
// CATÁLOGOS (valores guardados en BD)
// ============================================================================

export const MODALIDADES = ['papel', 'computadora'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

export const EXAMENES = ['lr', 'sw', 'bridge_lr', 'bridge_sw'] as const;
export type Examen = (typeof EXAMENES)[number];

export const MOMENTOS = ['antes', 'durante', 'despues'] as const;
export type Momento = (typeof MOMENTOS)[number];

export const TIPOS_COMENTARIO = [
  // Ambiente
  'ruido',
  'iluminacion_temperatura',
  'espacio_mobiliario',
  'ambiente_otro',
  // Audio, materiales y equipo
  'audio_volumen',
  'material_defectuoso',
  'falla_equipo',
  'audio_otro',
  // Procedimiento y personal
  'registro_id',
  'instrucciones_proctor',
  'trato_personal',
  'procedimiento_otro',
] as const;
export type TipoComentario = (typeof TIPOS_COMENTARIO)[number];

// ============================================================================
// ETIQUETAS BILINGÜES
// ============================================================================

type Etiqueta = { es: string; en: string };

export const MODALIDAD_LABELS: Record<Modalidad, Etiqueta> = {
  papel: { es: 'Papel', en: 'Paper' },
  computadora: { es: 'Computadora', en: 'Computer' },
};

export const EXAMEN_LABELS: Record<Examen, Etiqueta> = {
  lr: { es: 'L&R', en: 'L&R' },
  sw: { es: 'S&W', en: 'S&W' },
  bridge_lr: { es: 'Bridge L&R', en: 'Bridge L&R' },
  bridge_sw: { es: 'Bridge S&W', en: 'Bridge S&W' },
};

export const MOMENTO_LABELS: Record<Momento, Etiqueta> = {
  antes: { es: 'Antes', en: 'Before' },
  durante: { es: 'Durante', en: 'During' },
  despues: { es: 'Después del examen', en: 'After the exam' },
};

export const TIPO_COMENTARIO_LABELS: Record<TipoComentario, Etiqueta> = {
  ruido: { es: 'Ruido o distracciones', en: 'Noise or distractions' },
  iluminacion_temperatura: {
    es: 'Iluminación / temperatura',
    en: 'Lighting / temperature',
  },
  espacio_mobiliario: { es: 'Espacio o mobiliario', en: 'Space or furniture' },
  ambiente_otro: { es: 'Otro', en: 'Other' },

  audio_volumen: { es: 'Volumen o calidad del audio', en: 'Audio volume or quality' },
  material_defectuoso: {
    es: 'Material defectuoso o faltante',
    en: 'Defective or missing materials',
  },
  falla_equipo: {
    es: 'Falla de equipo o conexión',
    en: 'Equipment or connection failure',
  },
  audio_otro: { es: 'Otro', en: 'Other' },

  registro_id: { es: 'Registro / verificación de ID', en: 'Check-in / ID verification' },
  instrucciones_proctor: {
    es: 'Instrucciones del Proctor/TCA',
    en: 'Proctor/TCA instructions',
  },
  trato_personal: { es: 'Trato del personal', en: 'Staff treatment' },
  procedimiento_otro: { es: 'Otro', en: 'Other' },
};

// ============================================================================
// GRUPOS DE LA SECCIÓN 2 (para renderizar el formulario y las estadísticas)
// ============================================================================

export type GrupoTipoKey = 'ambiente' | 'audio' | 'procedimiento';

export interface GrupoTipo {
  key: GrupoTipoKey;
  titulo: Etiqueta;
  tipos: TipoComentario[];
  /** Código que habilita el campo de texto "Otro" de este grupo */
  otroTipo: TipoComentario;
  /** Columna de BD donde se guarda el texto de "Otro" */
  otroCampo: 'otro_ambiente' | 'otro_audio' | 'otro_procedimiento';
}

export const GRUPOS_TIPO: GrupoTipo[] = [
  {
    key: 'ambiente',
    titulo: { es: 'Ambiente', en: 'Environment' },
    tipos: ['ruido', 'iluminacion_temperatura', 'espacio_mobiliario', 'ambiente_otro'],
    otroTipo: 'ambiente_otro',
    otroCampo: 'otro_ambiente',
  },
  {
    key: 'audio',
    titulo: { es: 'Audio, materiales y equipo', en: 'Audio, materials & equipment' },
    tipos: ['audio_volumen', 'material_defectuoso', 'falla_equipo', 'audio_otro'],
    otroTipo: 'audio_otro',
    otroCampo: 'otro_audio',
  },
  {
    key: 'procedimiento',
    titulo: { es: 'Procedimiento y personal', en: 'Procedures & staff' },
    tipos: ['registro_id', 'instrucciones_proctor', 'trato_personal', 'procedimiento_otro'],
    otroTipo: 'procedimiento_otro',
    otroCampo: 'otro_procedimiento',
  },
];

// ============================================================================
// ENTIDADES
// ============================================================================

/** Registro tal como viene de la tabla `comentarios_examinado` */
export interface ComentarioExaminado {
  id: number;
  cliente_institucion: string | null;
  fecha_examen: string; // 'YYYY-MM-DD'
  centro_ubicacion: string;
  nombre_tca: string | null;
  modalidad: Modalidad;
  examen: Examen;
  nombre_examinado: string | null;
  id_asiento: string | null;
  tipos_comentario: TipoComentario[];
  otro_ambiente: string | null;
  otro_audio: string | null;
  otro_procedimiento: string | null;
  momento: Momento;
  descripcion: string;
  acepta_declaracion: boolean;
  idioma: Idioma;
  created_at: string;
}

/** Payload que envía el formulario público (sin id ni created_at) */
export interface ComentarioExaminadoInput {
  cliente_institucion: string | null;
  fecha_examen: string;
  centro_ubicacion: string;
  nombre_tca: string | null;
  modalidad: Modalidad;
  examen: Examen;
  nombre_examinado: string | null;
  id_asiento: string | null;
  tipos_comentario: TipoComentario[];
  otro_ambiente: string | null;
  otro_audio: string | null;
  otro_procedimiento: string | null;
  momento: Momento;
  descripcion: string;
  acepta_declaracion: true;
  idioma: Idioma;
}

// ============================================================================
// ESTADÍSTICAS (resumen para el admin)
// ============================================================================

export interface ConteoItem<T extends string = string> {
  clave: T;
  total: number;
}

export interface ComentarioExaminadoStats {
  total: number;
  ultimos7Dias: number;
  porModalidad: ConteoItem<Modalidad>[];
  porExamen: ConteoItem<Examen>[];
  porMomento: ConteoItem<Momento>[];
  porTipo: ConteoItem<TipoComentario>[];
  porCentro: ConteoItem[];
}

/** Etiqueta con el grupo cuando es una opción "Otro" (para stats y Excel) */
export const getTipoLabel = (tipo: TipoComentario, lang: Idioma): string => {
  const grupo = GRUPOS_TIPO.find((g) => g.otroTipo === tipo);
  const base = TIPO_COMENTARIO_LABELS[tipo][lang];
  return grupo ? `${base} (${grupo.titulo[lang]})` : base;
};