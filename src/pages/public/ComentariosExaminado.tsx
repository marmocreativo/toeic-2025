// src/pages/public/ComentariosExaminado.tsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { getAlternateLanguagePath } from '../../utils/languageUtils';
import {
  enviarComentario,
  getTextosFormulario,
} from '../../services/comentarioExaminadoService';
import type { TextosFormulario } from '../../services/comentarioExaminadoService';
import {
  CAMPO_LABELS,
  EXAMENES,
  EXAMEN_LABELS,
  GRUPOS_TIPO,
  MODALIDADES,
  MODALIDAD_LABELS,
  MOMENTOS,
  MOMENTO_LABELS,
  TIPOS_COMENTARIO,
  TIPO_COMENTARIO_LABELS,
} from '../../types/comentarioExaminado';
import type {
  ClaveTexto,
  ComentarioExaminadoInput,
  Examen,
  GrupoTipo,
  Idioma,
  Modalidad,
  Momento,
  TipoComentario,
} from '../../types/comentarioExaminado';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

// ============================================================================
// TEXTOS FIJOS DE LA INTERFAZ (no editables: botones, errores, placeholders)
// Los textos editables (título, instrucciones, avisos...) vienen de la BD.
// ============================================================================

const ui = {
  es: {
    otroPlaceholder: 'Especifique',
    required: 'Este campo es obligatorio',
    requiredTipos: 'Seleccione al menos un tipo de comentario',
    requiredOtro: 'Especifique el comentario',
    requiredDeclaracion: 'Debe confirmar la declaración para enviar',
    invalidEmail: 'Ingrese un correo electrónico válido',
    invalidPhone: 'Ingrese un teléfono válido',
    formErrors: 'Revise los campos marcados en rojo.',
    submitErrorTitle: 'No se pudo enviar',
    submitError:
      'Ocurrió un problema al enviar su comentario. Intente de nuevo en unos minutos.',
    submit: 'Enviar comentario',
    sending: 'Enviando...',
    another: 'Enviar otro comentario',
    otherLanguage: 'English',
  },
  en: {
    otroPlaceholder: 'Please specify',
    required: 'This field is required',
    requiredTipos: 'Select at least one comment type',
    requiredOtro: 'Please specify your comment',
    requiredDeclaracion: 'You must confirm the statement to submit',
    invalidEmail: 'Enter a valid email address',
    invalidPhone: 'Enter a valid phone number',
    formErrors: 'Please review the fields marked in red.',
    submitErrorTitle: 'Could not submit',
    submitError:
      'There was a problem submitting your comment. Please try again in a few minutes.',
    submit: 'Submit comment',
    sending: 'Sending...',
    another: 'Submit another comment',
    otherLanguage: 'Español',
  },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

const DESCRIPCION_MAX = 5000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[\d\s()+\-.]{7,30}$/;

/** Fecha local 'YYYY-MM-DD' (toISOString daría la fecha UTC y puede adelantar un día) */
const hoyLocal = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const limpio = (v: string): string | null => {
  const s = v.trim();
  return s ? s : null;
};

type OtroCampo = GrupoTipo['otroCampo'];

interface FormState {
  cliente_institucion: string;
  fecha_examen: string;
  centro_ubicacion: string;
  nombre_tca: string;
  modalidad: Modalidad | '';
  examen: Examen | '';
  nombre_examinado: string;
  id_asiento: string;
  telefono: string;
  correo: string;
  tipos: TipoComentario[];
  otros: Record<OtroCampo, string>;
  momento: Momento | '';
  descripcion: string;
  acepta: boolean;
  website: string; // honeypot
}

const crearFormVacio = (): FormState => ({
  cliente_institucion: '',
  fecha_examen: hoyLocal(),
  centro_ubicacion: '',
  nombre_tca: '',
  modalidad: '',
  examen: '',
  nombre_examinado: '',
  id_asiento: '',
  telefono: '',
  correo: '',
  tipos: [],
  otros: { otro_ambiente: '', otro_audio: '', otro_procedimiento: '' },
  momento: '',
  descripcion: '',
  acepta: false,
  website: '',
});

type Errors = Record<string, string>;

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

const Seccion = ({
  titulo,
  children,
}: {
  titulo?: string;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
    {titulo && (
      <h2 className="bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:text-base">
        {titulo}
      </h2>
    )}
    <div className="space-y-4 p-4 sm:p-5">{children}</div>
  </section>
);

const Campo = ({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div id={`field-${id}`} className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

// ============================================================================
// PÁGINA
// ============================================================================

const ComentariosExaminado = () => {
  const { language } = useLanguage();
  const lang: Idioma = language === 'en' ? 'en' : 'es';
  const tx = ui[lang];

  const location = useLocation();
  const otherLang: Idioma = lang === 'es' ? 'en' : 'es';
  const altPath = getAlternateLanguagePath(location.pathname, otherLang);

  const [textos, setTextos] = useState<TextosFormulario | null>(null);
  const [form, setForm] = useState<FormState>(crearFormVacio);
  const [errors, setErrors] = useState<Errors>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  /** Texto editable en el idioma actual (cadena vacía = bloque oculto) */
  const t = (clave: ClaveTexto): string => textos?.[clave][lang].trim() ?? '';

  // Cargar textos editables (getTextosFormulario nunca lanza error)
  useEffect(() => {
    let cancelled = false;
    getTextosFormulario().then((data) => {
      if (!cancelled) setTextos(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Página compartida solo por link/QR: que no se indexe
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const quitarError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setCampo = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    quitarError(key as string);
  };

  const toggleTipo = (tipo: TipoComentario, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      tipos: checked
        ? [...prev.tipos, tipo]
        : prev.tipos.filter((x) => x !== tipo),
    }));
    quitarError('tipos');
  };

  const setOtro = (campo: OtroCampo, value: string) => {
    setForm((prev) => ({ ...prev, otros: { ...prev.otros, [campo]: value } }));
    quitarError(campo);
  };

  // La declaración solo se pide si su texto no está vacío
  const mostrarDeclaracion = t('declaracion') !== '';

  // --------------------------------------------------------------------------
  // Validación
  // --------------------------------------------------------------------------

  const validar = (): Errors => {
    const e: Errors = {};
    if (!form.fecha_examen) e.fecha_examen = tx.required;
    if (!form.centro_ubicacion.trim()) e.centro_ubicacion = tx.required;
    if (!form.modalidad) e.modalidad = tx.required;
    if (!form.examen) e.examen = tx.required;
    if (!form.nombre_examinado.trim()) e.nombre_examinado = tx.required;

    if (form.telefono.trim() && !PHONE_RE.test(form.telefono.trim())) {
      e.telefono = tx.invalidPhone;
    }
    if (form.correo.trim() && !EMAIL_RE.test(form.correo.trim())) {
      e.correo = tx.invalidEmail;
    }

    if (form.tipos.length === 0) e.tipos = tx.requiredTipos;

    GRUPOS_TIPO.forEach((g) => {
      if (form.tipos.includes(g.otroTipo) && !form.otros[g.otroCampo].trim()) {
        e[g.otroCampo] = tx.requiredOtro;
      }
    });

    if (!form.momento) e.momento = tx.required;
    if (!form.descripcion.trim()) e.descripcion = tx.required;
    if (mostrarDeclaracion && !form.acepta) e.acepta = tx.requiredDeclaracion;
    return e;
  };

  // Orden en que aparecen los campos (para llevar al primer error)
  const ORDEN_CAMPOS = [
    'fecha_examen',
    'centro_ubicacion',
    'modalidad',
    'examen',
    'nombre_examinado',
    'telefono',
    'correo',
    'tipos',
    'otro_ambiente',
    'otro_audio',
    'otro_procedimiento',
    'momento',
    'descripcion',
    'acepta',
  ];

  // --------------------------------------------------------------------------
  // Envío
  // --------------------------------------------------------------------------

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(false);

    const e = validar();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const primero = ORDEN_CAMPOS.find((k) => e[k]);
      if (primero) {
        document
          .getElementById(`field-${primero}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Honeypot: un bot lo llena, un humano no lo ve. Se simula éxito sin guardar.
    if (form.website) {
      setEnviado(true);
      return;
    }

    const tipos = TIPOS_COMENTARIO.filter((x) => form.tipos.includes(x));

    const payload: ComentarioExaminadoInput = {
      cliente_institucion: limpio(form.cliente_institucion),
      fecha_examen: form.fecha_examen,
      centro_ubicacion: form.centro_ubicacion.trim(),
      nombre_tca: limpio(form.nombre_tca),
      modalidad: form.modalidad as Modalidad,
      examen: form.examen as Examen,
      nombre_examinado: limpio(form.nombre_examinado),
      id_asiento: limpio(form.id_asiento),
      telefono: limpio(form.telefono),
      correo: limpio(form.correo),
      tipos_comentario: tipos,
      otro_ambiente: tipos.includes('ambiente_otro')
        ? limpio(form.otros.otro_ambiente)
        : null,
      otro_audio: tipos.includes('audio_otro')
        ? limpio(form.otros.otro_audio)
        : null,
      otro_procedimiento: tipos.includes('procedimiento_otro')
        ? limpio(form.otros.otro_procedimiento)
        : null,
      momento: form.momento as Momento,
      descripcion: form.descripcion.trim(),
      acepta_declaracion: mostrarDeclaracion ? form.acepta : false,
      idioma: lang,
    };

    try {
      setEnviando(true);
      await enviarComentario(payload);
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      setSubmitError(true);
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setForm(crearFormVacio());
    setErrors({});
    setSubmitError(false);
    setEnviado(false);
  };

  // --------------------------------------------------------------------------
  // Render: cargando textos
  // --------------------------------------------------------------------------

  if (!textos) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // Render: éxito
  // --------------------------------------------------------------------------

  if (enviado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
          {t('exito_titulo') && (
            <h1 className="mb-2 text-2xl font-bold">{t('exito_titulo')}</h1>
          )}
          {t('exito_texto') && (
            <p className="mb-6 whitespace-pre-line text-muted-foreground">
              {t('exito_texto')}
            </p>
          )}
          <Button variant="outline" onClick={reiniciar}>
            {tx.another}
          </Button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // Render: formulario
  // --------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Selector de idioma */}
        <div className="flex justify-end">
          <Link
            to={altPath}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {tx.otherLanguage}
          </Link>
        </div>

        {/* Encabezado */}
        <header className="text-center">
          {t('programa') && (
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              {t('programa')}
            </p>
          )}
          {t('titulo') && (
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t('titulo')}</h1>
          )}
          {t('subtitulo') && (
            <p className="text-sm text-muted-foreground">{t('subtitulo')}</p>
          )}
        </header>

        {/* Instrucciones */}
        {t('intro') && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">
              {t('intro')}
            </AlertDescription>
          </Alert>
        )}

        {/* Aviso importante */}
        {t('aviso') && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <ShieldAlert className="h-4 w-4 !text-amber-700" />
            <AlertDescription className="whitespace-pre-line font-medium">
              {t('aviso')}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Honeypot (oculto a humanos) */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setCampo('website', e.target.value)}
            />
          </div>

          {/* ============ 1. DATOS ============ */}
          <Seccion titulo={t('seccion1')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="cliente_institucion" label={CAMPO_LABELS.institucion[lang]}>
                <Input
                  id="cliente_institucion"
                  maxLength={255}
                  value={form.cliente_institucion}
                  onChange={(e) => setCampo('cliente_institucion', e.target.value)}
                />
              </Campo>

              <Campo
                id="fecha_examen"
                label={CAMPO_LABELS.fecha[lang]}
                required
                error={errors.fecha_examen}
              >
                <Input
                  id="fecha_examen"
                  type="date"
                  max={hoyLocal()}
                  value={form.fecha_examen}
                  onChange={(e) => setCampo('fecha_examen', e.target.value)}
                />
              </Campo>

              <Campo
                id="centro_ubicacion"
                label={CAMPO_LABELS.ciudad[lang]}
                required
                error={errors.centro_ubicacion}
              >
                <Input
                  id="centro_ubicacion"
                  maxLength={255}
                  value={form.centro_ubicacion}
                  onChange={(e) => setCampo('centro_ubicacion', e.target.value)}
                />
              </Campo>

              <Campo id="nombre_tca" label={CAMPO_LABELS.aplicador[lang]}>
                <Input
                  id="nombre_tca"
                  maxLength={255}
                  value={form.nombre_tca}
                  onChange={(e) => setCampo('nombre_tca', e.target.value)}
                />
              </Campo>
            </div>

            <Campo
              id="modalidad"
              label={CAMPO_LABELS.modalidad[lang]}
              required
              error={errors.modalidad}
            >
              <RadioGroup
                value={form.modalidad}
                onValueChange={(v) => setCampo('modalidad', v as Modalidad)}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {MODALIDADES.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <RadioGroupItem value={m} id={`modalidad-${m}`} />
                    <Label htmlFor={`modalidad-${m}`} className="cursor-pointer font-normal">
                      {MODALIDAD_LABELS[m][lang]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Campo>

            <Campo
              id="examen"
              label={CAMPO_LABELS.examen[lang]}
              required
              error={errors.examen}
            >
              <RadioGroup
                value={form.examen}
                onValueChange={(v) => setCampo('examen', v as Examen)}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {EXAMENES.map((x) => (
                  <div key={x} className="flex items-center gap-2">
                    <RadioGroupItem value={x} id={`examen-${x}`} />
                    <Label htmlFor={`examen-${x}`} className="cursor-pointer font-normal">
                      {EXAMEN_LABELS[x][lang]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id="nombre_examinado"
                label={CAMPO_LABELS.nombre[lang]}
                required
                error={errors.nombre_examinado}
              >
                <Input
                  id="nombre_examinado"
                  maxLength={255}
                  autoComplete="name"
                  value={form.nombre_examinado}
                  onChange={(e) => setCampo('nombre_examinado', e.target.value)}
                />
              </Campo>

              <Campo id="id_asiento" label={CAMPO_LABELS.idAsiento[lang]}>
                <Input
                  id="id_asiento"
                  maxLength={50}
                  value={form.id_asiento}
                  onChange={(e) => setCampo('id_asiento', e.target.value)}
                />
              </Campo>

              <Campo id="telefono" label={CAMPO_LABELS.telefono[lang]} error={errors.telefono}>
                <Input
                  id="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={form.telefono}
                  onChange={(e) => setCampo('telefono', e.target.value)}
                />
              </Campo>

              <Campo id="correo" label={CAMPO_LABELS.correo[lang]} error={errors.correo}>
                <Input
                  id="correo"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={255}
                  value={form.correo}
                  onChange={(e) => setCampo('correo', e.target.value)}
                />
              </Campo>
            </div>
          </Seccion>

          {/* ============ 2. PROBLEMÁTICA ============ */}
          <Seccion titulo={t('seccion2')}>
            <div id="field-tipos" className="space-y-2">
              <div className="grid gap-4 md:grid-cols-3">
                {GRUPOS_TIPO.map((g) => (
                  <div key={g.key} className="space-y-3 rounded-md border bg-muted/30 p-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      {g.titulo[lang]}
                    </h3>

                    {g.tipos.map((tipo) => {
                      const checked = form.tipos.includes(tipo);
                      const esOtro = tipo === g.otroTipo;
                      return (
                        <div
                          key={tipo}
                          id={esOtro ? `field-${g.otroCampo}` : undefined}
                          className="space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`tipo-${tipo}`}
                              checked={checked}
                              onCheckedChange={(c) => toggleTipo(tipo, c === true)}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`tipo-${tipo}`}
                              className="cursor-pointer font-normal leading-snug"
                            >
                              {TIPO_COMENTARIO_LABELS[tipo][lang]}
                            </Label>
                          </div>

                          {esOtro && checked && (
                            <div className="pl-6">
                              <Input
                                aria-label={`${TIPO_COMENTARIO_LABELS[tipo][lang]} - ${tx.otroPlaceholder}`}
                                placeholder={tx.otroPlaceholder}
                                maxLength={255}
                                value={form.otros[g.otroCampo]}
                                onChange={(e) => setOtro(g.otroCampo, e.target.value)}
                              />
                              {errors[g.otroCampo] && (
                                <p className="mt-1 text-sm text-destructive">
                                  {errors[g.otroCampo]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {errors.tipos && <p className="text-sm text-destructive">{errors.tipos}</p>}
            </div>

            <Campo
              id="momento"
              label={CAMPO_LABELS.momento[lang]}
              required
              error={errors.momento}
            >
              <RadioGroup
                value={form.momento}
                onValueChange={(v) => setCampo('momento', v as Momento)}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {MOMENTOS.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <RadioGroupItem value={m} id={`momento-${m}`} />
                    <Label htmlFor={`momento-${m}`} className="cursor-pointer font-normal">
                      {MOMENTO_LABELS[m][lang]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Campo>
          </Seccion>

          {/* ============ 3. DESCRIPCIÓN ============ */}
          <Seccion titulo={t('seccion3')}>
            <Campo
              id="descripcion"
              label={t('descripcion_ayuda') || CAMPO_LABELS.momento[lang]}
              required
              error={errors.descripcion}
            >
              <Textarea
                id="descripcion"
                rows={8}
                maxLength={DESCRIPCION_MAX}
                value={form.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.descripcion.length}/{DESCRIPCION_MAX}
              </p>
            </Campo>

            {mostrarDeclaracion && (
              <div id="field-acepta" className="space-y-1.5 rounded-md border bg-muted/30 p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acepta"
                    checked={form.acepta}
                    onCheckedChange={(c) => setCampo('acepta', c === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="acepta"
                    className="cursor-pointer whitespace-pre-line font-normal leading-snug"
                  >
                    {t('declaracion')}
                  </Label>
                </div>
                {errors.acepta && <p className="text-sm text-destructive">{errors.acepta}</p>}
              </div>
            )}
          </Seccion>

          {/* Errores globales */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{tx.formErrors}</AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{tx.submitErrorTitle}</AlertTitle>
              <AlertDescription>{tx.submitError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tx.sending}
              </>
            ) : (
              tx.submit
            )}
          </Button>

          {t('confidencial') && (
            <p className="whitespace-pre-line pb-4 text-center text-xs text-muted-foreground">
              {t('confidencial')}
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default ComentariosExaminado;