// src/components/public/RegistroWizard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
// Si necesitas el tipo del examen, descomenta y ajústalo a tus tipos reales
// import type { ExamenCompleto } from "@/types/examen";

type RegistroWizardProps = {
  onClose?: () => void;
  onFinish?: () => void;
  // examen?: ExamenCompleto;
};

export default function RegistroWizard({ onClose, onFinish }: RegistroWizardProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(0); // 0..3

  const texts = {
    es: {
      title: "Registro de examen",
      steps: ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
      back: "Atrás",
      next: "Siguiente",
      finish: "Finalizar",
      close: "Cerrar",
      placeholder: "Contenido pendiente…",
    },
    en: {
      title: "Exam registration",
      steps: ["Step 1", "Step 2", "Step 3", "Step 4"],
      back: "Back",
      next: "Next",
      finish: "Finish",
      close: "Close",
      placeholder: "Content coming soon…",
    },
  };
  const t = texts[language];

  const totalSteps = 4;
  const percent = ((step + 1) / totalSteps) * 100;

  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else onFinish?.();
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="w-full">
      {/* Header inline para el wizard (el DialogHeader vive fuera, en el Dialog) */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">
            {t.steps[step]} / {totalSteps}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Progreso */}
      <div className="mb-4">
        <Progress value={percent} />
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        {t.steps.map((label, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`h-6 px-2 rounded-full border ${
                i === step
                  ? "bg-primary text-white border-primary"
                  : i < step
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {label}
            </div>
            {i < t.steps.length - 1 && <div className="w-4 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      {/* Contenido del paso (placeholder/“en blanco”) */}
      <div className="min-h-[220px] rounded-lg border border-dashed border-border p-6 bg-background">
        <p className="text-sm text-muted-foreground">{t.placeholder}</p>
      </div>

      {/* Controles */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={step === 0 ? onClose : goBack}>
          {step === 0 ? t.close : t.back}
        </Button>

        <Button onClick={goNext}>{step === totalSteps - 1 ? t.finish : t.next}</Button>
      </div>
    </div>
  );
}
