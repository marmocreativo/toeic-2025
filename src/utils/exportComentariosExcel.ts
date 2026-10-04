// src/utils/exportComentariosExcel.ts
import * as XLSX from 'xlsx';
import {
  CAMPO_LABELS,
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
    [CAMPO_LABELS.institucion.es]: r.cliente_institucion ?? '',
    [CAMPO_LABELS.fecha.es]: aFecha(r.fecha_examen),
    [CAMPO_LABELS.ciudad.es]: r.centro_ubicacion,
    [CAMPO_LABELS.aplicador.es]: r.nombre_tca ?? '',
    [CAMPO_LABELS.modalidad.es]: MODALIDAD_LABELS[r.modalidad].es,
    [CAMPO_LABELS.examen.es]: EXAMEN_LABELS[r.examen].es,
    [CAMPO_LABELS.nombre.es]: r.nombre_examinado ?? '',
    [CAMPO_LABELS.idAsiento.es]: r.id_asiento ?? '',
    [CAMPO_LABELS.telefono.es]: r.telefono ?? '',
    [CAMPO_LABELS.correo.es]: r.correo ?? '',
    // Una columna por grupo: Ambiente / Audio, materiales y equipo / Procedimiento y personal
    ...Object.fromEntries(
      GRUPOS_TIPO.map((g) => [g.titulo.es, textoGrupo(r, g)])
    ),
    [CAMPO_LABELS.momento.es]: MOMENTO_LABELS[r.momento].es,
    Descripción: r.descripcion,
    'Declaración aceptada': r.acepta_declaracion ? 'Sí' : 'No',
  }));

  const wsRespuestas = XLSX.utils.json_to_sheet(filas, { dateNF: 'dd/mm/yyyy' });
  wsRespuestas['!cols'] = [
    { wch: 6 }, // ID
    { wch: 18 }, // Fecha de envío
    { wch: 10 }, // Idioma
    { wch: 26 }, // Institución
    { wch: 18 }, // Fecha de aplicación
    { wch: 24 }, // Ciudad
    { wch: 24 }, // Nombre del aplicador
    { wch: 13 }, // Modalidad
    { wch: 12 }, // Examen
    { wch: 28 }, // Nombre del examinado
    { wch: 14 }, // ID / asiento
    { wch: 16 }, // Teléfono
    { wch: 28 }, // Correo electrónico
    { wch: 36 }, // Ambiente
    { wch: 36 }, // Audio, materiales y equipo
    { wch: 36 }, // Procedimiento y personal
    { wch: 18 }, // ¿Cuándo ocurrió?
    { wch: 70 }, // Descripción
    { wch: 14 }, // Declaración aceptada
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
    ['Ciudades distintas', stats.porCentro.length]
  );

  const bloque = (titulo: string, items: { label: string; total: number }[]) => {
    aoa.push([], [titulo, 'Total', '% del total']);
    items.forEach((i) => aoa.push([i.label, i.total, pct(i.total)]));
  };

  bloque(
    CAMPO_LABELS.modalidad.es,
    stats.porModalidad.map((m) => ({ label: MODALIDAD_LABELS[m.clave].es, total: m.total }))
  );
  bloque(
    CAMPO_LABELS.examen.es,
    stats.porExamen.map((x) => ({ label: EXAMEN_LABELS[x.clave].es, total: x.total }))
  );
  bloque(
    CAMPO_LABELS.momento.es,
    stats.porMomento.map((m) => ({ label: MOMENTO_LABELS[m.clave].es, total: m.total }))
  );
  bloque(
    'Problemática (un comentario puede tener varias)',
    stats.porTipo.map((t) => ({ label: getTipoLabel(t.clave, 'es'), total: t.total }))
  );
  bloque(
    CAMPO_LABELS.ciudad.es,
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