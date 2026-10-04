// src/components/admin/ComentariosTextosEditor.tsx

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, RotateCcw, Save, Undo2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  getTextosFormulario,
  guardarTextos,
} from '../../services/comentarioExaminadoService';
import type { TextosFormulario } from '../../services/comentarioExaminadoService';
import { generateLocalizedPath } from '../../utils/languageUtils';
import {
  CLAVES_TEXTO,
  TEXTOS_DEFAULT,
  TEXTOS_META,
} from '../../types/comentarioExaminado';
import type { ClaveTexto, Idioma } from '../../types/comentarioExaminado';

const MAX_CHARS = 2000; // mismo límite que el CHECK de la tabla

const IDIOMAS: { lang: Idioma; label: string }[] = [
  { lang: 'es', label: 'Español' },
  { lang: 'en', label: 'English' },
];

/** Copia profunda simple (los textos son solo strings) */
const clonar = (t: TextosFormulario): TextosFormulario => JSON.parse(JSON.stringify(t));

/** Misma limpieza que aplica guardarTextos, para comparar y mostrar lo guardado */
const normalizar = (t: TextosFormulario): TextosFormulario => {
  const copia = clonar(t);
  CLAVES_TEXTO.forEach((clave) => {
    copia[clave].es = copia[clave].es.trim();
    copia[clave].en = copia[clave].en.trim();
  });
  return copia;
};

export default function ComentariosTextosEditor() {
  const [textos, setTextos] = useState<TextosFormulario | null>(null);
  const [original, setOriginal] = useState<TextosFormulario | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // getTextosFormulario nunca lanza error: si falla, devuelve los textos por defecto
  useEffect(() => {
    let cancelled = false;
    getTextosFormulario().then((data) => {
      if (cancelled) return;
      setTextos(clonar(data));
      setOriginal(clonar(data));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hayCambios = useMemo(() => {
    if (!textos || !original) return false;
    return JSON.stringify(normalizar(textos)) !== JSON.stringify(normalizar(original));
  }, [textos, original]);

  const handleChange = (clave: ClaveTexto, lang: Idioma, value: string) => {
    setTextos((prev) =>
      prev ? { ...prev, [clave]: { ...prev[clave], [lang]: value } } : prev
    );
    setSaved(false);
    setError(null);
  };

  const handleRestoreDefault = (clave: ClaveTexto, lang: Idioma) => {
    handleChange(clave, lang, TEXTOS_DEFAULT[clave][lang]);
  };

  const handleDiscard = () => {
    if (!original) return;
    setTextos(clonar(original));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!textos) return;
    try {
      setSaving(true);
      setError(null);
      await guardarTextos(textos);
      const guardado = normalizar(textos);
      setTextos(clonar(guardado));
      setOriginal(clonar(guardado));
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('No se pudieron guardar los textos. Intenta de nuevo.');
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  if (!textos) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-text-muted">Cargando textos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Introducción */}
      <Card className="bg-bg-light rounded-lg border border-border">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-text-muted max-w-2xl">
            Aquí puedes cambiar la redacción del formulario público: título, instrucciones,
            avisos y mensajes, en español e inglés. Los textos marcados como "Déjalo vacío
            para ocultarlo" desaparecen del formulario si los vacías. Los cambios se ven en el
            formulario al guardar.
          </p>
          <Button variant="outline" asChild className="border-border flex-shrink-0">
            <a
              href={generateLocalizedPath('comentarios', 'es')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver formulario
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Un bloque por texto */}
      {TEXTOS_META.map((meta) => (
        <Card key={meta.clave} className="bg-bg-light rounded-lg border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-primary">{meta.nombre}</CardTitle>
            {meta.ayuda && <p className="text-xs text-text-muted">{meta.ayuda}</p>}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {IDIOMAS.map(({ lang, label }) => {
                const valor = textos[meta.clave][lang];
                const esDefault = valor === TEXTOS_DEFAULT[meta.clave][lang];
                const id = `texto-${meta.clave}-${lang}`;

                return (
                  <div key={lang} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={id} className="text-xs text-text-muted">
                        {label}
                      </Label>
                      {!esDefault && (
                        <button
                          type="button"
                          onClick={() => handleRestoreDefault(meta.clave, lang)}
                          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary"
                          title="Volver al texto original"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Texto original
                        </button>
                      )}
                    </div>

                    {meta.multilinea ? (
                      <Textarea
                        id={id}
                        rows={3}
                        maxLength={MAX_CHARS}
                        value={valor}
                        onChange={(e) => handleChange(meta.clave, lang, e.target.value)}
                        className="border-border focus:border-primary resize-y"
                      />
                    ) : (
                      <Input
                        id={id}
                        maxLength={MAX_CHARS}
                        value={valor}
                        onChange={(e) => handleChange(meta.clave, lang, e.target.value)}
                        className="border-border focus:border-primary"
                      />
                    )}

                    {valor.trim() === '' && (
                      <p className="text-xs text-amber-700">
                        Vacío: este texto no se mostrará en el formulario.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Barra de guardado */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-border bg-bg-light/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-h-[1.25rem] text-sm">
            {error && <span className="text-red-600">{error}</span>}
            {!error && saved && !hayCambios && (
              <span className="inline-flex items-center gap-1.5 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Cambios guardados
              </span>
            )}
            {!error && hayCambios && (
              <span className="text-amber-700">Tienes cambios sin guardar</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscard}
              disabled={!hayCambios || saving}
              className="border-border"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hayCambios || saving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar textos'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}