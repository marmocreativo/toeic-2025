// src/services/comentarioExaminadoService.ts
import { supabase } from '../lib/supabase';
import {
  EXAMENES,
  MODALIDADES,
  MOMENTOS,
  TIPOS_COMENTARIO,
} from '../types/comentarioExaminado';
import type {
  ComentarioExaminado,
  ComentarioExaminadoInput,
  ComentarioExaminadoStats,
  ConteoItem,
  Examen,
  Modalidad,
  Momento,
  TipoComentario,
} from '../types/comentarioExaminado';

const TABLE = 'comentarios_examinado';
const BATCH_SIZE = 1000; // límite por request de Supabase

// ============================================================================
// FILTROS
// ============================================================================

export interface ComentarioFiltros {
  busqueda?: string;
  desde?: string; // 'YYYY-MM-DD' (fecha_examen)
  hasta?: string; // 'YYYY-MM-DD' (fecha_examen)
  modalidad?: Modalidad | '';
  examen?: Examen | '';
  momento?: Momento | '';
  tipo?: TipoComentario | '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function aplicarFiltros(query: any, f: ComentarioFiltros = {}) {
  if (f.desde) query = query.gte('fecha_examen', f.desde);
  if (f.hasta) query = query.lte('fecha_examen', f.hasta);
  if (f.modalidad) query = query.eq('modalidad', f.modalidad);
  if (f.examen) query = query.eq('examen', f.examen);
  if (f.momento) query = query.eq('momento', f.momento);
  if (f.tipo) query = query.contains('tipos_comentario', [f.tipo]);

  // Se limpian caracteres que rompen la sintaxis de .or() de PostgREST
  const term = f.busqueda?.trim().replace(/[,()%*"\\]/g, ' ').trim();
  if (term) {
    const p = `"%${term}%"`;
    query = query.or(
      [
        `nombre_examinado.ilike.${p}`,
        `centro_ubicacion.ilike.${p}`,
        `nombre_tca.ilike.${p}`,
        `id_asiento.ilike.${p}`,
        `cliente_institucion.ilike.${p}`,
        `descripcion.ilike.${p}`,
      ].join(',')
    );
  }
  return query;
}

// ============================================================================
// PÚBLICO: enviar formulario
// ============================================================================

/**
 * Importante: NO encadenar .select() — el rol anon solo tiene INSERT por RLS,
 * pedir el registro de vuelta falla por falta de permiso SELECT.
 */
export async function enviarComentario(
  input: ComentarioExaminadoInput
): Promise<void> {
  const { error } = await supabase.from(TABLE).insert(input);
  if (error) throw error;
}

// ============================================================================
// ADMIN: listado, detalle, borrado
// ============================================================================

export async function getComentarios(
  filtros: ComentarioFiltros = {},
  page = 1,
  pageSize = 20
): Promise<{ data: ComentarioExaminado[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const query = aplicarFiltros(
    supabase.from(TABLE).select('*', { count: 'exact' }),
    filtros
  )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as ComentarioExaminado[], total: count ?? 0 };
}

export async function getComentarioById(
  id: number
): Promise<ComentarioExaminado | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as ComentarioExaminado | null) ?? null;
}

export async function deleteComentario(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Trae TODOS los registros que cumplan los filtros, en lotes de 1000.
 * Se usa para estadísticas y para exportar a Excel.
 */
export async function getTodosLosComentarios(
  filtros: ComentarioFiltros = {}
): Promise<ComentarioExaminado[]> {
  const todos: ComentarioExaminado[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await aplicarFiltros(
      supabase.from(TABLE).select('*'),
      filtros
    )
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;
    const lote = (data ?? []) as ComentarioExaminado[];
    todos.push(...lote);
    if (lote.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }

  return todos;
}

// ============================================================================
// ESTADÍSTICAS (se calculan en cliente sobre los registros ya filtrados)
// ============================================================================

function contarCatalogo<T extends string>(
  catalogo: readonly T[],
  valores: T[]
): ConteoItem<T>[] {
  const mapa = new Map<T, number>(catalogo.map((c) => [c, 0]));
  valores.forEach((v) => mapa.set(v, (mapa.get(v) ?? 0) + 1));
  return catalogo.map((clave) => ({ clave, total: mapa.get(clave) ?? 0 }));
}

export function calcularStats(
  rows: ComentarioExaminado[]
): ComentarioExaminadoStats {
  const hace7Dias = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Centros: texto libre, se agrupa sin distinguir mayúsculas ni espacios extra
  const centros = new Map<string, { clave: string; total: number }>();
  rows.forEach((r) => {
    const original = (r.centro_ubicacion || '').trim();
    if (!original) return;
    const key = original.toLowerCase();
    const actual = centros.get(key);
    if (actual) actual.total += 1;
    else centros.set(key, { clave: original, total: 1 });
  });

  return {
    total: rows.length,
    ultimos7Dias: rows.filter(
      (r) => new Date(r.created_at).getTime() >= hace7Dias
    ).length,
    porModalidad: contarCatalogo(
      MODALIDADES,
      rows.map((r) => r.modalidad)
    ),
    porExamen: contarCatalogo(
      EXAMENES,
      rows.map((r) => r.examen)
    ),
    porMomento: contarCatalogo(
      MOMENTOS,
      rows.map((r) => r.momento)
    ),
    porTipo: contarCatalogo(
      TIPOS_COMENTARIO,
      rows.flatMap((r) => r.tipos_comentario ?? [])
    ).sort((a, b) => b.total - a.total),
    porCentro: Array.from(centros.values()).sort((a, b) => b.total - a.total),
  };
}

export async function getComentarioStats(
  filtros: ComentarioFiltros = {}
): Promise<ComentarioExaminadoStats> {
  const rows = await getTodosLosComentarios(filtros);
  return calcularStats(rows);
}