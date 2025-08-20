// src/components/public/ExtrasSidebar.tsx
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface ExtrasSidebarProps {
  extras: any[];
}

export default function ExtrasSidebar({ extras }: ExtrasSidebarProps) {
  const { language } = useLanguage();

  const extrasPublicados = extras?.filter(e => e.publicado) || [];

  if (extrasPublicados.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {extrasPublicados.map((extra, index) => (
        <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border p-4">
          <h3 className="font-semibold text-text mb-2">
            {language === 'es' ? (extra.titulo || '') : (extra.en_titulo || '')}
          </h3>
          <div 
            className="wysiwyg-content extra-content text-sm text-text-muted mb-3"
            dangerouslySetInnerHTML={{ 
              __html: language === 'es' ? (extra.contenido || '') : (extra.en_contenido || '') 
            }}
          />
          {extra.boton_texto && extra.boton_enlace && (
            <a 
              href={extra.boton_enlace} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              {language === 'es' ? (extra.boton_texto || '') : (extra.en_boton_texto || '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}