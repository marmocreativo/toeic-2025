// src/pages/admin/AdminComentariosExaminado.tsx

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  MessageSquareText,
  QrCode,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  EXAMENES,
  EXAMEN_LABELS,
  GRUPOS_TIPO,
  MODALIDADES,
  MODALIDAD_LABELS,
  MOMENTOS,
  MOMENTO_LABELS,
  TIPOS_COMENTARIO,
  getTipoLabel,
} from '../../types/comentarioExaminado';
import type {
  ComentarioExaminado,
  Examen,
  Modalidad,
  Momento,
  TipoComentario,
} from '../../types/comentarioExaminado';
import {
  calcularStats,
  deleteComentario,
  getTodosLosComentarios,
} from '../../services/comentarioExaminadoService';
import type { ComentarioFiltros } from '../../services/comentarioExaminadoService';
import { exportComentariosExcel } from '../../utils/exportComentariosExcel';
import ComentariosQrDialog from '../../components/admin/ComentariosQrDialog';

const PAGE_SIZE = 20;

// ============================================================================
// HELPERS
// ============================================================================

/** 'YYYY-MM-DD' -> fecha local (T00:00:00 evita el desfase de zona horaria) */
const formatFecha = (s: string) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatFechaHora = (s: string) =>
  new Date(s).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

const dash = (v: string | null | undefined) => (v && v.trim() ? v : '—');

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

function BarList({
  items,
  base,
}: {
  items: { label: string; total: number }[];
  base: number;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">Sin datos</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.total));

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-text">{i.label}</span>
            <span className="flex-shrink-0 font-medium text-primary">
              {i.total}
              <span className="ml-1 font-normal text-text-muted">
                ({base ? Math.round((i.total / base) * 100) : 0}%)
              </span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(i.total / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm text-text">{value}</p>
    </div>
  );
}

// ============================================================================
// PÁGINA
// ============================================================================

export default function AdminComentariosExaminado() {
  const [rows, setRows] = useState<ComentarioExaminado[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('all');
  const [filterExamen, setFilterExamen] = useState('all');
  const [filterMomento, setFilterMomento] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');

  // Paginación y detalle
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ComentarioExaminado | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  // Debounce de la búsqueda de texto
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filtros = useMemo<ComentarioFiltros>(
    () => ({
      busqueda: debouncedSearch,
      desde,
      hasta,
      modalidad: filterModalidad === 'all' ? '' : (filterModalidad as Modalidad),
      examen: filterExamen === 'all' ? '' : (filterExamen as Examen),
      momento: filterMomento === 'all' ? '' : (filterMomento as Momento),
      tipo: filterTipo === 'all' ? '' : (filterTipo as TipoComentario),
    }),
    [debouncedSearch, desde, hasta, filterModalidad, filterExamen, filterMomento, filterTipo]
  );

  // Carga (los filtros se aplican en servidor)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getTodosLosComentarios(filtros);
        if (cancelled) return;
        setRows(data);
        setPage(1);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError('Error al cargar los comentarios');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFirstLoad(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filtros, reloadKey]);

  const stats = useMemo(() => calcularStats(rows), [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters =
    searchTerm !== '' ||
    desde !== '' ||
    hasta !== '' ||
    filterModalidad !== 'all' ||
    filterExamen !== 'all' ||
    filterMomento !== 'all' ||
    filterTipo !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDesde('');
    setHasta('');
    setFilterModalidad('all');
    setFilterExamen('all');
    setFilterMomento('all');
    setFilterTipo('all');
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }
    try {
      await deleteComentario(id);
      setSelected(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el comentario');
    }
  };

    const handleExport = () => {
    try {
      exportComentariosExcel(rows, stats, hasFilters);
    } catch (err) {
      console.error(err);
      setError('Error al exportar a Excel');
    }
  };

  if (firstLoad && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-text-muted">Cargando comentarios...</span>
        </div>
      </div>
    );
  }

  const tipoMasFrecuente = stats.porTipo[0]?.total ? stats.porTipo[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-primary mb-2">Comentarios del Examinado</h1>
          <p className="text-secondary">
            Respuestas del Candidate Comment Form enviadas desde el formulario público
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || rows.length === 0}
            className="border-border hover:bg-primary/10 hover:border-primary/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar a Excel ({rows.length})
          </Button>
        <Button
            variant="outline"
            onClick={() => setQrOpen(true)}
            className="border-border hover:bg-primary/10 hover:border-primary/30"
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR / Link
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-bg-light rounded-lg border border-border">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar por examinado, centro, TCA, ID/asiento, institución o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:border-primary"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted">Fecha del examen (desde)</Label>
              <Input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
                className="border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted">Fecha del examen (hasta)</Label>
              <Input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className="border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted">Modalidad</Label>
              <Select value={filterModalidad} onValueChange={setFilterModalidad}>
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {MODALIDADES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODALIDAD_LABELS[m].es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted">Examen</Label>
              <Select value={filterExamen} onValueChange={setFilterExamen}>
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {EXAMENES.map((x) => (
                    <SelectItem key={x} value={x}>
                      {EXAMEN_LABELS[x].es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted">¿Cuándo ocurrió?</Label>
              <Select value={filterMomento} onValueChange={setFilterMomento}>
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {MOMENTOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MOMENTO_LABELS[m].es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-text-muted">Tipo de comentario</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {TIPOS_COMENTARIO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {getTipoLabel(t, 'es')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="border-border hover:bg-bg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="respuestas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="respuestas">Respuestas ({rows.length})</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {/* ================= RESPUESTAS ================= */}
        <TabsContent value="respuestas" className="space-y-4">
          {loading && (
            <p className="text-sm text-text-muted">Actualizando resultados...</p>
          )}

          {pageRows.map((r) => (
            <Card
              key={r.id}
              className="bg-bg-light rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-full flex-shrink-0 bg-primary/10">
                      <MessageSquareText className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <span className="font-semibold text-primary truncate">
                          {dash(r.nombre_examinado)}
                        </span>
                        <Badge variant="outline" className="border-primary text-primary">
                          {MODALIDAD_LABELS[r.modalidad].es}
                        </Badge>
                        <Badge variant="outline" className="border-secondary text-secondary">
                          {EXAMEN_LABELS[r.examen].es}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700">
                          {MOMENTO_LABELS[r.momento].es}
                        </Badge>
                        <Badge variant="outline" className="uppercase">
                          {r.idioma}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{r.centro_ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Examen: {formatFecha(r.fecha_examen)}</span>
                        </div>
                        <span>
                          {r.tipos_comentario.length}{' '}
                          {r.tipos_comentario.length === 1 ? 'tipo' : 'tipos'} de comentario
                        </span>
                      </div>

                      <p className="text-sm text-text line-clamp-2">{r.descripcion}</p>
                      <p className="text-xs text-text-muted">
                        Enviado: {formatFechaHora(r.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(r)}
                      className="border-border hover:bg-primary/10 hover:border-primary/30"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      className="border-border hover:bg-red-50 hover:border-red-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Estado vacío */}
          {rows.length === 0 && !loading && (
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <ClipboardList className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-text">
                      {hasFilters ? 'No se encontraron comentarios' : 'Aún no hay comentarios'}
                    </h3>
                    <p className="text-text-muted">
                      {hasFilters
                        ? 'Intenta modificar los filtros de búsqueda.'
                        : 'Cuando alguien envíe el formulario público, aparecerá aquí.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paginación */}
          {rows.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-text-muted">
                Página {page} de {totalPages} · {rows.length} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ================= ESTADÍSTICAS ================= */}
        <TabsContent value="estadisticas" className="space-y-6">
          {hasFilters && (
            <p className="text-sm text-text-muted">
              Las estadísticas reflejan los filtros aplicados.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-text-muted">
                  Total de comentarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">{stats.total}</div>
                <div className="text-sm text-text-muted">
                  <span className="text-primary font-medium">{stats.ultimos7Dias}</span> en los
                  últimos 7 días
                </div>
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-text-muted">
                  Centros con comentarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-1">
                  {stats.porCentro.length}
                </div>
                <div className="text-sm text-text-muted">centros distintos</div>
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-text-muted">
                  Tipo más reportado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-primary mb-1 leading-snug">
                  {tipoMasFrecuente ? getTipoLabel(tipoMasFrecuente.clave, 'es') : '—'}
                </div>
                <div className="text-sm text-text-muted">
                  {tipoMasFrecuente ? `${tipoMasFrecuente.total} menciones` : 'Sin datos'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-bg-light rounded-lg border border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-primary">
                  Tipo de comentario
                </CardTitle>
                <p className="text-xs text-text-muted">
                  Un comentario puede tener varios tipos; el porcentaje es sobre el total de
                  comentarios.
                </p>
              </CardHeader>
              <CardContent>
                <BarList
                  base={stats.total}
                  items={stats.porTipo
                    .filter((t) => t.total > 0)
                    .map((t) => ({ label: getTipoLabel(t.clave, 'es'), total: t.total }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-primary">Modalidad</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  base={stats.total}
                  items={stats.porModalidad.map((m) => ({
                    label: MODALIDAD_LABELS[m.clave].es,
                    total: m.total,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-primary">Examen</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  base={stats.total}
                  items={stats.porExamen.map((x) => ({
                    label: EXAMEN_LABELS[x.clave].es,
                    total: x.total,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-primary">
                  ¿Cuándo ocurrió?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  base={stats.total}
                  items={stats.porMomento.map((m) => ({
                    label: MOMENTO_LABELS[m.clave].es,
                    total: m.total,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-bg-light rounded-lg border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-primary">
                  Centros (top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  base={stats.total}
                  items={stats.porCentro
                    .slice(0, 10)
                    .map((c) => ({ label: c.clave, total: c.total }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ================= DETALLE ================= */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium text-primary">
                  Comentario #{selected.id}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* 1. Datos */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">
                    1. Datos del examen y del examinado
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border bg-bg p-4">
                    <Dato label="Cliente / Institución" value={dash(selected.cliente_institucion)} />
                    <Dato label="Fecha del examen" value={formatFecha(selected.fecha_examen)} />
                    <Dato label="Centro / Ubicación" value={selected.centro_ubicacion} />
                    <Dato label="TCA / aplicador" value={dash(selected.nombre_tca)} />
                    <Dato label="Modalidad" value={MODALIDAD_LABELS[selected.modalidad].es} />
                    <Dato label="Examen" value={EXAMEN_LABELS[selected.examen].es} />
                    <Dato label="Nombre del examinado" value={dash(selected.nombre_examinado)} />
                    <Dato label="ID / asiento" value={dash(selected.id_asiento)} />
                  </div>
                </section>

                {/* 2. Tipo de comentario */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">2. Tipo de comentario</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {GRUPOS_TIPO.map((g) => {
                      const marcados = g.tipos.filter((t) =>
                        selected.tipos_comentario.includes(t)
                      );
                      return (
                        <div
                          key={g.key}
                          className="space-y-2 rounded-lg border border-border bg-bg p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            {g.titulo.es}
                          </p>
                          {marcados.length === 0 ? (
                            <p className="text-sm text-text-muted">—</p>
                          ) : (
                            <ul className="space-y-1 text-sm text-text">
                              {marcados.map((t) => (
                                <li key={t} className="flex gap-2">
                                  <span className="text-primary">•</span>
                                  <span>
                                    {t === g.otroTipo
                                      ? `Otro: ${dash(selected[g.otroCampo])}`
                                      : getTipoLabel(t, 'es')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Dato label="¿Cuándo ocurrió?" value={MOMENTO_LABELS[selected.momento].es} />
                </section>

                {/* 3. Descripción */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">3. Descripción</h3>
                  <div className="rounded-lg border border-border bg-bg p-4 text-sm text-text whitespace-pre-wrap break-words">
                    {selected.descripcion}
                  </div>
                </section>

                {/* Metadatos */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-text-muted">
                    Enviado el {formatFechaHora(selected.created_at)} · Idioma:{' '}
                    {selected.idioma === 'es' ? 'Español' : 'English'} · Declaración aceptada
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selected.id)}
                    className="border-border hover:bg-red-50 hover:border-red-200 text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    <ComentariosQrDialog open={qrOpen} onOpenChange={setQrOpen} />
    </div>
  );
}