// src/components/public/OtrosExamenes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { examenService } from '../../services/examenService';
import type { Examen } from '../../types/examen';
import {
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface OtrosExamenesProps {
  currentExamenId: number;
}

export default function OtrosExamenes({ currentExamenId }: OtrosExamenesProps) {
  const [otrosExamenes, setOtrosExamenes] = useState<Examen[]>([]);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Otros Exámenes TOEIC®',
      viewDetails: 'Ver Detalles'
    },
    en: {
      title: 'Other TOEIC® Tests',
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
            <Link
                  key={examen.id}
                  to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                  className="exam-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer block"
                >
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Columna Izquierda - Imagen */}
                    <div className="col-span-5">
                      {examen.imagen ? (
                        <img
                          src={examen.imagen}
                          alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg rounded-lg flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    {/* Columna Derecha - Contenido */}
                    <div className="col-span-7 flex flex-col justify-center p-4">
                      <h3 className="text-lg font-semibold text-text mb-3 leading-tight">
                        {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                      </h3>
                      
                      <p className="text-text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                        {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                      </p>

                      <div className="inline-flex items-center text-primary font-medium group">
                        <span>{currentTexts.viewDetails}</span>
                        <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
          ))}
        </div>
      </div>
    </section>
  );
}