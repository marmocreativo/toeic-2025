// src/pages/public/Home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { sliderService } from '../../services/sliderService';
import { examenService } from '../../services/examenService';
import type { Slider } from '../../types/slider';
import type { Examen } from '../../types/examen';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Award, 
  Building2, 
  ArrowRight,
  Clock,
  Globe,
  Target,
  BookOpen
} from 'lucide-react';

// Componente de Slider Principal
const HeroSlider = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();

        useEffect(() => {
    const loadSliders = async () => {
      try {
        const data = await sliderService.getPublishedSliders();
        setSliders(data);
      } catch (error) {
        console.error('Error loading sliders:', error);
      }
    };
    loadSliders();
  }, []);

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliders.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  if (sliders.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">TOEIC 2025</h1>
          <p className="text-xl">Tu camino hacia el éxito profesional</p>
        </div>
      </div>
    );
  }

  const currentSlider = sliders[currentSlide];

  return (
    <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slider Content */}
      <div className="relative h-full">
        {currentSlider.imagen && (
          <img
            src={currentSlider.imagen}
            alt={language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                {language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
              </h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                {language === 'es' ? (currentSlider.subtitulo || '') : (currentSlider.en_subtitulo || '')}
              </p>
              {currentSlider.extra && (
                <p className="text-base md:text-lg mb-8 opacity-80">
                  {language === 'es' ? (currentSlider.extra || '') : (currentSlider.en_extra || '')}
                </p>
              )}
              {currentSlider.boton_texto && currentSlider.boton_enlace && (
                <Link
                  to={currentSlider.boton_enlace}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {language === 'es' ? (currentSlider.boton_texto || '') : (currentSlider.en_boton_texto || '')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// Componente de Numeralia
const StatsSection = () => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'TOEIC en Números',
      students: 'Estudiantes Anuales',
      countries: 'Países',
      centers: 'Centros Autorizados',
    },
    en: {
      title: 'TOEIC in Numbers',
      students: 'Annual Students',
      countries: 'Countries',
      centers: 'Authorized Centers',
    }
  };

  const currentTexts = texts[language];

  const stats = [
    {
      icon: Users,
      number: '7M+',
      label: currentTexts.students,
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      number: '160+',
      label: currentTexts.countries,
      color: 'text-green-600'
    },
    {
      icon: Building2,
      number: '14,000+',
      label: currentTexts.centers,
      color: 'text-purple-600'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {currentTexts.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
              <p className="text-lg text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente ¿Qué es TOEIC?
const AboutToeicSection = () => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: '¿Qué es TOEIC?',
      subtitle: 'El estándar mundial para evaluar el inglés en el trabajo',
      description: 'TOEIC (Test of English for International Communication) es la evaluación líder mundial de habilidades en inglés utilizada en el lugar de trabajo. Más de 14,000 organizaciones en 160 países confían en las puntuaciones TOEIC.',
      features: [
        {
          icon: Target,
          title: 'Evaluación Precisa',
          description: 'Mide con precisión las habilidades de inglés necesarias en entornos profesionales internacionales.'
        },
        {
          icon: Award,
          title: 'Reconocimiento Global',
          description: 'Aceptado por empresas, universidades y organizaciones gubernamentales en todo el mundo.'
        },
        {
          icon: Clock,
          title: 'Resultados Rápidos',
          description: 'Obtén tus resultados en línea en un plazo de 13 días hábiles después del examen.'
        }
      ]
    },
    en: {
      title: 'What is TOEIC?',
      subtitle: 'The global standard for assessing English-language communication skills used in the workplace',
      description: 'TOEIC (Test of English for International Communication) is the world\'s leading assessment of English-language skills used in the workplace. More than 14,000 organizations in 160 countries trust TOEIC scores.',
      features: [
        {
          icon: Target,
          title: 'Accurate Assessment',
          description: 'Precisely measures English skills needed in international professional environments.'
        },
        {
          icon: Award,
          title: 'Global Recognition',
          description: 'Accepted by companies, universities, and government organizations worldwide.'
        },
        {
          icon: Clock,
          title: 'Fast Results',
          description: 'Get your results online within 13 business days after the test.'
        }
      ]
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentTexts.title}
          </h2>
          <p className="text-xl text-blue-600 mb-6">
            {currentTexts.subtitle}
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {currentTexts.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentTexts.features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente de Exámenes
const ExamsSection = () => {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Exámenes Disponibles',
      viewMore: 'Ver Todos los Exámenes',
      learnMore: 'Conoce Más'
    },
    en: {
      title: 'Available Tests',
      viewMore: 'View All Tests',
      learnMore: 'Learn More'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadExamenes = async () => {
      try {
        const data = await examenService.getExamenes();
        const publicExamenes = data.filter(examen => examen.publicado).slice(0, 4);
        setExamenes(publicExamenes);
      } catch (error) {
        console.error('Error loading examenes:', error);
      }
    };
    loadExamenes();
  }, []);

  const examenesLink = generateLocalizedPath('examenes', language);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentTexts.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {examenes.map((examen) => (
            <div key={examen.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {examen.imagen && (
                <img
                  src={examen.imagen}
                  alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                </p>
                <Link
                  to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  {currentTexts.learnMore}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to={examenesLink}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {currentTexts.viewMore}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Componente Carrusel de Logos
const PartnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Organizaciones que Confían en TOEIC'
    },
    en: {
      title: 'Organizations that Trust TOEIC'
    }
  };

  const currentTexts = texts[language];

  // Logos placeholder - en producción serían logos reales
  const logos = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Partner ${i + 1}`,
    image: `https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Logo+${i + 1}`
  }));

  const itemsToShow = 5;
  const maxIndex = Math.max(0, logos.length - itemsToShow);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {currentTexts.title}
        </h2>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
            >
              {logos.map((logo) => (
                <div 
                  key={logo.id} 
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsToShow}%` }}
                >
                  <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-32 hover:shadow-md transition-shadow">
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

// Componente de Llamada a la Acción
const CallToActionSection = () => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: '¿Listo para Comenzar tu Evaluación TOEIC?',
      description: 'Encuentra tu centro de examen más cercano y programa tu prueba TOEIC hoy mismo.',
      primaryButton: 'Encontrar Centros',
      secondaryButton: 'Ver Exámenes'
    },
    en: {
      title: 'Ready to Start Your TOEIC Assessment?',
      description: 'Find your nearest test center and schedule your TOEIC test today.',
      primaryButton: 'Find Centers',
      secondaryButton: 'View Tests'
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {currentTexts.title}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {currentTexts.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={generateLocalizedPath('centros', language)}
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Building2 className="mr-2 w-5 h-5" />
            {currentTexts.primaryButton}
          </Link>
          <Link
            to={generateLocalizedPath('examenes', language)}
            className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
          >
            <BookOpen className="mr-2 w-5 h-5" />
            {currentTexts.secondaryButton}
          </Link>
        </div>
      </div>
    </section>
  );
};

// Componente Principal Home
export default function Home() {
  return (
    <div>
      <HeroSlider />
      <StatsSection />
      <AboutToeicSection />
      <ExamsSection />
      <PartnersCarousel />
      <CallToActionSection />
    </div>
  );
}