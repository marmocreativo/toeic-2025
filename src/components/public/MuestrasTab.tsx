// src/components/public/MuestrasTab.tsx
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface MuestrasTabProps {
  muestras: any[];
}

export default function MuestrasTab({ muestras }: MuestrasTabProps) {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Preguntas de Práctica',
      noSamples: 'No hay muestras disponibles',
      section: 'Sección'
    },
    en: {
      title: 'Practice Questions',
      noSamples: 'No samples available',
      section: 'Section'
    }
  };

  const currentTexts = texts[language];
  const muestrasPublicadas = muestras?.filter(m => m.publicado) || [];

  return (
    <div>
      {muestrasPublicadas.length > 0 ? (
        <div className="space-y-6">
          {muestrasPublicadas.map((muestra, index) => (
            <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {currentTexts.section}: {muestra.seccion}
                </h3>
              </div>
              <div className="p-4">
                {/* Usar wysiwyg-content también para las muestras */}
                <div 
                  className="wysiwyg-content"
                  dangerouslySetInnerHTML={{ __html: muestra.pregunta || '' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            {currentTexts.noSamples}
          </h3>
          <p className="text-text-muted">
            {language === 'es' 
              ? 'Las preguntas de práctica estarán disponibles pronto' 
              : 'Practice questions will be available soon'}
          </p>
        </div>
      )}
    </div>
  );
}