// src/components/public/ContenidoTab.tsx
import { FileText } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { ExamenCompleto } from '../../types/examen';

interface ContenidoTabProps {
  examen: ExamenCompleto;
}

export default function ContenidoTab({ examen }: ContenidoTabProps) {
  const { language } = useLanguage();

  const contenido = language === 'es' ? (examen.contenido || '') : (examen.en_contenido || '');

  return (
    <div className="prose prose-lg max-w-none">
      {contenido ? (
        <div 
          className="wysiwyg-content"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-border mx-auto mb-4" />
          <p className="text-text-muted">
            {language === 'es' ? 'Contenido no disponible' : 'Content not available'}
          </p>
        </div>
      )}
    </div>
  );
}