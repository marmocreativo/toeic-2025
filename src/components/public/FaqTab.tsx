// src/components/public/FaqTab.tsx
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface FaqTabProps {
  faqs: any[];
}

export default function FaqTab({ faqs }: FaqTabProps) {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Preguntas Frecuentes',
      noFaqs: 'No hay preguntas frecuentes disponibles'
    },
    en: {
      title: 'Frequently Asked Questions',
      noFaqs: 'No FAQs available'
    }
  };

  const currentTexts = texts[language];
  const faqsPublicadas = faqs?.filter(f => f.publicado) || [];

  return (
    <div>
      {faqsPublicadas.length > 0 ? (
        <div className="space-y-4">
          {faqsPublicadas.map((faq, index) => (
            <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border p-6">
              <h3 className="font-semibold text-text mb-3 flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                {language === 'es' ? (faq.pregunta || '') : (faq.en_pregunta || '')}
              </h3>
              <div 
                className="wysiwyg-content faq-content text-text-muted leading-relaxed pl-7"
                dangerouslySetInnerHTML={{ 
                  __html: language === 'es' ? (faq.respuesta || '') : (faq.en_respuesta || '') 
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            {currentTexts.noFaqs}
          </h3>
          <p className="text-text-muted">
            {language === 'es' 
              ? 'Las preguntas frecuentes estarán disponibles pronto' 
              : 'FAQs will be available soon'}
          </p>
        </div>
      )}
    </div>
  );
}