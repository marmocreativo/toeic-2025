import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';

import { Button } from '@/components/ui/button';

export default function PreparationMaterial() {
    const { language } = useLanguage();

    const texts = {
        es: {
        title: 'Materiales de preparación para el exámen TOEIC',
        subtitle: 'Prepárate para el éxito con manuales oficiales para examinandos, exámenes de muestra y otros materiales de preparación para el examen',
        },
        en: {
        title: 'TOEIC Test Preparation Materials',
        subtitle: 'Prepare for success with official examinee handbooks, sample tests and other test prep materials.',
        }
    };

    const currentTexts = texts[language];


    return (
        <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-primary py-16 -mt-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-4">
              {currentTexts.title}
            </h1>
            <p className="text-xl md:text-2xl text-primary/90 mb-8 max-w-3xl mx-auto">
              {currentTexts.subtitle}
            </p>
          </div>
        </div>
      </section>
      </div>
    );
}