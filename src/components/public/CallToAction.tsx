// src/components/public/CallToAction.tsx
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';

export default function CallToAction() {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: '¡No lo pienses más!',
      description: 'Encuentra el centro más cercano y programa tu examen TOEIC hoy mismo.',
      primaryButton: 'Encontrar Centros',
      secondaryButton: 'Ver Horarios'
    },
    en: {
      title: 'Ready to Schedule Your Exam?',
      description: 'Find the nearest center and schedule your TOEIC exam today.',
      primaryButton: 'Find Centers',
      secondaryButton: 'View Schedules'
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 gradient-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentTexts.title}
            </h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              {currentTexts.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={generateLocalizedPath('centros', language)}
                className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
              >
                <Building2 className="w-5 h-5 mr-2" />
                {currentTexts.primaryButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}