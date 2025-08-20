// src/components/public/ExamenHero.tsx
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { ExamenCompleto } from '../../types/examen';

interface ExamenHeroProps {
  examen: ExamenCompleto;
}

export default function ExamenHero({ examen }: ExamenHeroProps) {
  const { language } = useLanguage();

  return (
    <section className="gradient-hero text-white py-4 -mt-16 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-primary font-medium mb-4">
              {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
            </h1>
            <p className="text-xl md:text-2xl text-primary/90 mb-6 leading-relaxed">
              {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
            </p>
          </div>

          {/* Image */}
          <div className="lg:col-span-1">
            {examen.imagen ? (
              <img
                src={examen.imagen}
                alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full h-64 lg:h-80 gradient-accent rounded-lg shadow-xl flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-black" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}