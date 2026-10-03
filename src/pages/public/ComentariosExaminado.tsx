// src/pages/public/ComentariosExaminado.tsx
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { enviarComentario } from '../../services/comentarioExaminadoService';
import {
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
// TEXTOS BILINGÜES
// ============================================================================

const texts = {
  es: {
    program: 'TOEIC® PROGRAM',
    title: 'Formato de comentarios del examinado',
    subtitle: 'Candidate Comment Form',
    intro:
      'Use este formato para comentar las condiciones del examen (ambiente, audio, materiales, procedimientos o personal).',
    importantLabel: 'IMPORTANTE:',
    importantText:
      'NO escriba preguntas, respuestas ni contenido del examen. Este formato no sustituye al Reporte de Irregularidad.',
    s1: '1. Datos del examen y del examinado',
    cliente: 'Cliente / Institución',
    fecha: 'Fecha',
    centro: 'Centro / Ubicación',
    tca: 'Nombre del TCA / aplicador',
    modalidad: 'Modalidad',
    examen: 'Examen',
    nombre: 'Nombre del examinado',
    idAsiento: 'ID / asiento',
    s2: '2. Tipo de comentario (marque todos los que apliquen)',
    otroPlaceholder: 'Especifique',
    cuando: '¿Cuándo ocurrió?',
    s3: '3. Descripción',
    s3Hint: 'Describa qué ocurrió, cuándo y dónde.',
    declaracion:
      'Confirmo que la información proporcionada es verídica y que no incluí preguntas, respuestas ni contenido del examen.',
    confidencial:
      'CONFIDENCIAL: Uso interno del EPN/Centro Evaluador únicamente.',
    submit: 'Enviar comentario',
    sending: 'Enviando...',
    required: 'Este campo es obligatorio',
    requiredTipos: 'Seleccione al menos un tipo de comentario',
    requiredOtro: 'Especifique el comentario',
    requiredDeclaracion: 'Debe confirmar la declaración para enviar',
    formErrors: 'Revise los campos marcados en rojo.',
    submitErrorTitle: 'No se pudo enviar',
    submitError:
      'Ocurrió un problema al enviar su comentario. Intente de nuevo en unos minutos.',
    successTitle: '¡Gracias por sus comentarios!',
    successText: 'Su comentario fue enviado correctamente.',
    another: 'Enviar otro comentario',
  },
  en: {
    program: 'TOEIC® PROGRAM',
    title: 'Candidate Comment Form',
    subtitle: 'Formato de comentarios del examinado',
    intro:
      'Use this form to comment on test conditions (environment, audio, materials, procedures or staff).',
    importantLabel: 'IMPORTANT:',
    importantText:
      'DO NOT write test questions, answers or test content. This form does not replace the Irregularity Report.',
    s1: '1. Test and candidate information',
    cliente: 'Client / Institution',
    fecha: 'Date',
    centro: 'Test center / Location',
    tca: 'TCA / proctor name',
    modalidad: 'Mode',
    examen: 'Test',
    nombre: 'Candidate name',
    idAsiento: 'ID / seat',
    s2: '2. Type of comment (check all that apply)',
    otroPlaceholder: 'Please specify',
    cuando: 'When did it happen?',
    s3: '3. Description',
    s3Hint: 'Describe what happened, when and where.',
    declaracion:
      'I confirm that the information provided is true and that I did not include test questions, answers or test content.',
    confidencial:
      'CONFIDENTIAL: For internal use of the EPN/Test Center only.',
    submit: 'Submit comment',
    sending: 'Sending...',
    required: 'This field is required',
    requiredTipos: 'Select at least one comment type',
    requiredOtro: 'Please specify your comment',
    requiredDeclaracion: 'You must confirm the statement to submit',
    formErrors: 'Please review the fields marked in red.',
    submitErrorTitle: 'Could not submit',
    submitError:
      'There was a problem submitting your comment. Please try again in a few minutes.',
    successTitle: 'Thank you for your feedback!',
    successText: 'Your comment was submitted successfully.',
    another: 'Submit another comment',
  },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

const DESCRIPCION_MAX = 5000;

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
  titulo: string;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
    <h2 className="bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:text-base">
      {titulo}
    </h2>
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
  const tx = texts[lang];

  const [form, setForm] = useState<FormState>(crearFormVacio);
  const [errors, setErrors] = useState<Errors>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [submitError, setSubmitError] = useState(false);

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

  const setCampo = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const toggleTipo = (tipo: TipoComentario, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      tipos: checked
        ? [...prev.tipos, tipo]
        : prev.tipos.filter((t) => t !== tipo),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.tipos;
      return next;
    });
  };

  const setOtro = (campo: OtroCampo, value: string) => {
    setForm((prev) => ({ ...prev, otros: { ...prev.otros, [campo]: value } }));
    if (errors[campo]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[campo];
        return next;
      });
    }
  };

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
    if (form.tipos.length === 0) e.tipos = tx.requiredTipos;

    GRUPOS_TIPO.forEach((g) => {
      if (form.tipos.includes(g.otroTipo) && !form.otros[g.otroCampo].trim()) {
        e[g.otroCampo] = tx.requiredOtro;
      }
    });

    if (!form.momento) e.momento = tx.required;
    if (!form.descripcion.trim()) e.descripcion = tx.required;
    if (!form.acepta) e.acepta = tx.requiredDeclaracion;
    return e;
  };

  const ORDEN_CAMPOS = [
    'fecha_examen',
    'centro_ubicacion',
    'modalidad',
    'examen',
    'nombre_examinado',
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

    const tipos = TIPOS_COMENTARIO.filter((t) => form.tipos.includes(t));

    const payload: ComentarioExaminadoInput = {
      cliente_institucion: limpio(form.cliente_institucion),
      fecha_examen: form.fecha_examen,
      centro_ubicacion: form.centro_ubicacion.trim(),
      nombre_tca: limpio(form.nombre_tca),
      modalidad: form.modalidad as Modalidad,
      examen: form.examen as Examen,
      nombre_examinado: limpio(form.nombre_examinado),
      id_asiento: limpio(form.id_asiento),
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
      acepta_declaracion: true,
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
  // Render: éxito
  // --------------------------------------------------------------------------

  if (enviado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
          <h1 className="mb-2 text-2xl font-bold">{tx.successTitle}</h1>
          <p className="mb-6 text-muted-foreground">{tx.successText}</p>
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
        {/* Encabezado */}
        <header className="text-center">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            {tx.program}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{tx.title}</h1>
          <p className="text-sm text-muted-foreground">{tx.subtitle}</p>
        </header>

        {/* Instrucciones */}
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p>{tx.intro}</p>
            <p>
              <strong>{tx.importantLabel}</strong>{' '}
              <strong>{tx.importantText}</strong>
            </p>
          </AlertDescription>
        </Alert>

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
          <Seccion titulo={tx.s1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="cliente_institucion" label={tx.cliente}>
                <Input
                  id="cliente_institucion"
                  maxLength={255}
                  value={form.cliente_institucion}
                  onChange={(e) => setCampo('cliente_institucion', e.target.value)}
                />
              </Campo>

              <Campo id="fecha_examen" label={tx.fecha} required error={errors.fecha_examen}>
                <Input
                  id="fecha_examen"
                  type="date"
                  max={hoyLocal()}
                  value={form.fecha_examen}
                  onChange={(e) => setCampo('fecha_examen', e.target.value)}
                />
              </Campo>

              <Campo id="centro_ubicacion" label={tx.centro} required error={errors.centro_ubicacion}>
                <Input
                  id="centro_ubicacion"
                  maxLength={255}
                  value={form.centro_ubicacion}
                  onChange={(e) => setCampo('centro_ubicacion', e.target.value)}
                />
              </Campo>

              <Campo id="nombre_tca" label={tx.tca}>
                <Input
                  id="nombre_tca"
                  maxLength={255}
                  value={form.nombre_tca}
                  onChange={(e) => setCampo('nombre_tca', e.target.value)}
                />
              </Campo>
            </div>

            <Campo id="modalidad" label={tx.modalidad} required error={errors.modalidad}>
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

            <Campo id="examen" label={tx.examen} required error={errors.examen}>
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
              <Campo id="nombre_examinado" label={tx.nombre} required error={errors.nombre_examinado}>
                <Input
                  id="nombre_examinado"
                  maxLength={255}
                  autoComplete="name"
                  value={form.nombre_examinado}
                  onChange={(e) => setCampo('nombre_examinado', e.target.value)}
                />
              </Campo>

              <Campo id="id_asiento" label={tx.idAsiento}>
                <Input
                  id="id_asiento"
                  maxLength={50}
                  value={form.id_asiento}
                  onChange={(e) => setCampo('id_asiento', e.target.value)}
                />
              </Campo>
            </div>
          </Seccion>

          {/* ============ 2. TIPO DE COMENTARIO ============ */}
          <Seccion titulo={tx.s2}>
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
                        <div key={tipo} id={esOtro ? `field-${g.otroCampo}` : undefined} className="space-y-2">
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

            <Campo id="momento" label={tx.cuando} required error={errors.momento}>
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
          <Seccion titulo={tx.s3}>
            <Campo id="descripcion" label={tx.s3Hint} required error={errors.descripcion}>
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

            <div id="field-acepta" className="space-y-1.5 rounded-md border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="acepta"
                  checked={form.acepta}
                  onCheckedChange={(c) => setCampo('acepta', c === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="acepta" className="cursor-pointer font-normal leading-snug">
                  {tx.declaracion}
                </Label>
              </div>
              {errors.acepta && <p className="text-sm text-destructive">{errors.acepta}</p>}
            </div>
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

          <p className="pb-4 text-center text-xs text-muted-foreground">{tx.confidencial}</p>
        </form>
      </div>
    </main>
  );
};

export default ComentariosExaminado;