// src/utils/exportComentariosExcel.ts
import * as XLSX from 'xlsx';
import {
  EXAMEN_LABELS,
  GRUPOS_TIPO,
  MODALIDAD_LABELS,
  MOMENTO_LABELS,
  getTipoLabel,
} from '../types/comentarioExaminado';
import type {
  ComentarioExaminado,
  ComentarioExaminadoStats,
  GrupoTipo,
} from '../types/comentarioExaminado';

const p2 = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' -> Date local (T00:00:00 evita el desfase de zona horaria) */
const aFecha = (s: string) => new Date(`${s}T00:00:00`);

const aFechaHora = (d: Date) =>
  `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;

/** Tipos marcados de un grupo, separados por "; " (la opción "Otro" lleva su texto) */
const textoGrupo = (r: ComentarioExaminado, g: GrupoTipo): string =>
  g.tipos
    .filter((t) => r.tipos_comentario.includes(t))
    .map((t) =>
      t === g.otroTipo
        ? `Otro: ${r[g.otroCampo] ?? ''}`.trim()
        : getTipoLabel(t, 'es')
    )
    .join('; ');

export function exportComentariosExcel(
  rows: ComentarioExaminado[],
  stats: ComentarioExaminadoStats,
  filtrado = false
): void {
  const wb = XLSX.utils.book_new();

  // ==========================================================================
  // Hoja 1: Respuestas (una fila por comentario)
  // ==========================================================================
  const filas = rows.map((r) => ({
    ID: r.id,
    'Fecha de envío': aFechaHora(new Date(r.created_at)),
    Idioma: r.idioma === 'es' ? 'Español' : 'English',
    'Cliente / Institución': r.cliente_institucion ?? '',
    'Fecha del examen': aFecha(r.fecha_examen),
    'Centro / Ubicación': r.centro_ubicacion,
    'TCA / Aplicador': r.nombre_tca ?? '',
    Modalidad: MODALIDAD_LABELS[r.modalidad].es,
    Examen: EXAMEN_LABELS[r.examen].es,
    'Nombre del examinado': r.nombre_examinado ?? '',
    'ID / Asiento': r.id_asiento ?? '',
    // Una columna por grupo: Ambiente / Audio, materiales y equipo / Procedimiento y personal
    ...Object.fromEntries(
      GRUPOS_TIPO.map((g) => [g.titulo.es, textoGrupo(r, g)])
    ),
    '¿Cuándo ocurrió?': MOMENTO_LABELS[r.momento].es,
    Descripción: r.descripcion,
  }));

  const wsRespuestas = XLSX.utils.json_to_sheet(filas, { dateNF: 'dd/mm/yyyy' });
  wsRespuestas['!cols'] = [
    { wch: 6 }, // ID
    { wch: 18 }, // Fecha de envío
    { wch: 10 }, // Idioma
    { wch: 26 }, // Cliente
    { wch: 14 }, // Fecha del examen
    { wch: 28 }, // Centro
    { wch: 24 }, // TCA
    { wch: 13 }, // Modalidad
    { wch: 12 }, // Examen
    { wch: 28 }, // Nombre
    { wch: 14 }, // ID / Asiento
    { wch: 36 }, // Ambiente
    { wch: 36 }, // Audio
    { wch: 36 }, // Procedimiento
    { wch: 18 }, // Cuándo
    { wch: 70 }, // Descripción
  ];
  XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Respuestas');

  // ==========================================================================
  // Hoja 2: Resumen (estadísticas generales)
  // ==========================================================================
  const pct = (n: number) => ({
    t: 'n' as const,
    v: stats.total ? n / stats.total : 0,
    z: '0%',
  });

  const aoa: unknown[][] = [
    ['Comentarios del examinado — Resumen'],
    ['Generado', aFechaHora(new Date())],
  ];
  if (filtrado) {
    aoa.push(['Nota', 'Datos filtrados según los filtros activos al exportar']);
  }
  aoa.push(
    [],
    ['Total de comentarios', stats.total],
    ['Últimos 7 días', stats.ultimos7Dias],
    ['Centros distintos', stats.porCentro.length]
  );

  const bloque = (titulo: string, items: { label: string; total: number }[]) => {
    aoa.push([], [titulo, 'Total', '% del total']);
    items.forEach((i) => aoa.push([i.label, i.total, pct(i.total)]));
  };

  bloque(
    'Modalidad',
    stats.porModalidad.map((m) => ({ label: MODALIDAD_LABELS[m.clave].es, total: m.total }))
  );
  bloque(
    'Examen',
    stats.porExamen.map((x) => ({ label: EXAMEN_LABELS[x.clave].es, total: x.total }))
  );
  bloque(
    '¿Cuándo ocurrió?',
    stats.porMomento.map((m) => ({ label: MOMENTO_LABELS[m.clave].es, total: m.total }))
  );
  bloque(
    'Tipo de comentario (un comentario puede tener varios)',
    stats.porTipo.map((t) => ({ label: getTipoLabel(t.clave, 'es'), total: t.total }))
  );
  bloque(
    'Centro / Ubicación',
    stats.porCentro.map((c) => ({ label: c.clave, total: c.total }))
  );

  const wsResumen = XLSX.utils.aoa_to_sheet(aoa);
  wsResumen['!cols'] = [{ wch: 52 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // ==========================================================================
  // Descarga
  // ==========================================================================
  const hoy = new Date();
  const nombre = `comentarios_examinado_${hoy.getFullYear()}-${p2(hoy.getMonth() + 1)}-${p2(hoy.getDate())}.xlsx`;
  XLSX.writeFile(wb, nombre);
}