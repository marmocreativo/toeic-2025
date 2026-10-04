// src/types/comentarioExaminado.ts

export type Idioma = 'es' | 'en';

type Etiqueta = { es: string; en: string };

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
    es: 'Instrucciones del aplicador',
    en: 'Test administrator instructions',
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
// ETIQUETAS DE CAMPOS (formulario, detalle del admin y Excel)
// ============================================================================

export const CAMPO_LABELS = {
  institucion: { es: 'Institución', en: 'Institution' },
  fecha: { es: 'Fecha de aplicación', en: 'Test date' },
  ciudad: { es: 'Ciudad', en: 'City' },
  aplicador: { es: 'Nombre del aplicador', en: 'Administrator name' },
  modalidad: { es: 'Modalidad', en: 'Mode' },
  examen: { es: 'Examen', en: 'Test' },
  nombre: { es: 'Nombre del examinado', en: 'Candidate name' },
  idAsiento: { es: 'ID / asiento', en: 'ID / seat' },
  telefono: { es: 'Teléfono', en: 'Phone' },
  correo: { es: 'Correo electrónico', en: 'Email' },
  momento: { es: '¿Cuándo ocurrió?', en: 'When did it happen?' },
} as const satisfies Record<string, Etiqueta>;

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
  telefono: string | null;
  correo: string | null;
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
  telefono: string | null;
  correo: string | null;
  tipos_comentario: TipoComentario[];
  otro_ambiente: string | null;
  otro_audio: string | null;
  otro_procedimiento: string | null;
  momento: Momento;
  descripcion: string;
  acepta_declaracion: boolean;
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

// ============================================================================
// TEXTOS EDITABLES DEL FORMULARIO (tabla comentarios_formulario_textos)
// ============================================================================

export const CLAVES_TEXTO = [
  'programa',
  'titulo',
  'subtitulo',
  'intro',
  'aviso',
  'seccion1',
  'seccion2',
  'seccion3',
  'descripcion_ayuda',
  'declaracion',
  'confidencial',
  'exito_titulo',
  'exito_texto',
] as const;
export type ClaveTexto = (typeof CLAVES_TEXTO)[number];

/** Fila de la tabla */
export interface TextoFormulario {
  clave: ClaveTexto;
  texto_es: string;
  texto_en: string;
  updated_at?: string | null;
}

/** Respaldo si la fila no existe o la consulta falla (igual al SQL inicial) */
export const TEXTOS_DEFAULT: Record<ClaveTexto, Etiqueta> = {
  programa: { es: 'TOEIC® PROGRAM', en: 'TOEIC® PROGRAM' },
  titulo: {
    es: 'Candidato-Reporte de incidencias TOEIC®',
    en: 'Candidate Incident Report – TOEIC®',
  },
  subtitulo: { es: '', en: '' },
  intro: {
    es: 'Use este formato para comentar las condiciones del examen (ambiente, audio, materiales, procedimientos o personal).',
    en: 'Use this form to comment on test conditions (environment, audio, materials, procedures or staff).',
  },
  aviso: {
    es: 'IMPORTANTE: NO escriba preguntas, respuestas ni contenido del examen. Este formato no sustituye al Reporte de Irregularidad.',
    en: 'IMPORTANT: DO NOT write test questions, answers or test content. This form does not replace the Irregularity Report.',
  },
  seccion1: {
    es: '1. Datos del examen y del examinado',
    en: '1. Test and candidate information',
  },
  seccion2: {
    es: '2. Problemática (marque todos los que apliquen)',
    en: '2. Issues (check all that apply)',
  },
  seccion3: { es: '3. Descripción', en: '3. Description' },
  descripcion_ayuda: {
    es: 'Describa qué ocurrió, cuándo y dónde.',
    en: 'Describe what happened, when and where.',
  },
  declaracion: {
    es: 'Confirmo que la información proporcionada es verídica y que no incluí preguntas, respuestas ni contenido del examen.',
    en: 'I confirm that the information provided is true and that I did not include test questions, answers or test content.',
  },
  confidencial: {
    es: 'CONFIDENCIAL: Uso interno del EPN/Centro Evaluador únicamente.',
    en: 'CONFIDENTIAL: For internal use of the EPN/Test Center only.',
  },
  exito_titulo: {
    es: '¡Gracias por sus comentarios!',
    en: 'Thank you for your feedback!',
  },
  exito_texto: {
    es: 'Su comentario fue enviado correctamente.',
    en: 'Your comment was submitted successfully.',
  },
};

/** Cómo se presenta cada texto en el editor del admin (en orden de aparición en el formulario) */
export interface TextoMeta {
  clave: ClaveTexto;
  nombre: string;
  ayuda?: string;
  multilinea: boolean;
}

export const TEXTOS_META: TextoMeta[] = [
  { clave: 'programa', nombre: 'Programa (texto superior)', multilinea: false },
  { clave: 'titulo', nombre: 'Título', multilinea: false },
  {
    clave: 'subtitulo',
    nombre: 'Subtítulo',
    ayuda: 'Déjalo vacío para ocultarlo.',
    multilinea: false,
  },
  { clave: 'intro', nombre: 'Instrucciones', multilinea: true },
  {
    clave: 'aviso',
    nombre: 'Aviso importante',
    ayuda: 'Se muestra resaltado. Déjalo vacío para ocultarlo.',
    multilinea: true,
  },
  { clave: 'seccion1', nombre: 'Título de la sección 1', multilinea: false },
  { clave: 'seccion2', nombre: 'Título de la sección 2', multilinea: false },
  { clave: 'seccion3', nombre: 'Título de la sección 3', multilinea: false },
  { clave: 'descripcion_ayuda', nombre: 'Ayuda del campo de descripción', multilinea: false },
  {
    clave: 'declaracion',
    nombre: 'Declaración del examinado',
    ayuda: 'Si la dejas vacía, el checkbox de confirmación no se muestra.',
    multilinea: true,
  },
  {
    clave: 'confidencial',
    nombre: 'Pie de página (confidencialidad)',
    ayuda: 'Déjalo vacío para ocultarlo.',
    multilinea: true,
  },
  { clave: 'exito_titulo', nombre: 'Mensaje de éxito: título', multilinea: false },
  { clave: 'exito_texto', nombre: 'Mensaje de éxito: texto', multilinea: true },
];