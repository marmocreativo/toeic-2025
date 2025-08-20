// src/components/public/OtrosExamenes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { examenService } from '../../services/examenService';
import type { Examen } from '../../types/examen';

interface OtrosExamenesProps {
  currentExamenId: number;
}

export default function OtrosExamenes({ currentExamenId }: OtrosExamenesProps) {
  const [otrosExamenes, setOtrosExamenes] = useState<Examen[]>([]);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Otros Exámenes TOEIC',
      viewDetails: 'Ver Detalles'
    },
    en: {
      title: 'Other TOEIC Tests',
      viewDetails: 'View Details'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadOtrosExamenes = async () => {
      try {
        const data = await examenService.getExamenes();
        const otrosExamenesFiltrados = data
          .filter(e => e.publicado && e.id !== currentExamenId)
          .slice(0, 2);
        setOtrosExamenes(otrosExamenesFiltrados);
      } catch (error) {
        console.error('Error loading otros examenes:', error);
      }
    };
    loadOtrosExamenes();
  }, [currentExamenId]);

  if (otrosExamenes.length === 0) return null;

  return (
    <section className="py-16 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-medium text-center text-primary mb-12">
          {currentTexts.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otrosExamenes.map((examen) => (
            <div key={examen.id} className="bg-bg-light rounded-lg shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
              {examen.imagen && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={examen.imagen}
                    alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-text mb-3">
                  {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                </h3>
                <p className="text-text-muted mb-4 line-clamp-3">
                  {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                </p>
                <Link 
                  to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                >
                  {currentTexts.viewDetails}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}