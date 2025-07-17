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
  Building2, 
  ArrowRight
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
      <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden -mt-16">
        {/* Background con gradiente radial */}
        <div className="absolute inset-0 bg-gradient-radial from-bg-light from-40% to-bg-dark to-90%" />
        
        {/* Contenido por defecto */}
        <div className="relative h-full flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full min-h-[400px]">
              <div className="space-y-6">
                <div className="mb-8">
                  <img 
                    src="./images/logo.png" 
                    alt="TOEIC Logo" 
                    className="h-12 md:h-16 w-auto"
                  />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text leading-tight">
                  TOEIC 2025
                </h1>
                <p className="text-lg md:text-xl text-text-muted leading-relaxed">
                  Tu camino hacia el éxito profesional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlider = sliders[currentSlide];

  return (
    <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden -mt-16">
      {/* Background con gradiente radial */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Texto extra como fondo - Posición absoluta centrada */}
      {currentSlider.extra && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-64">
          <h2 className="font-open-sans text-6xl md:text-8xl lg:text-9xl font-black text-white/60 select-none text-center leading-none">
            {language === 'es' ? (currentSlider.extra || '') : (currentSlider.en_extra || '')}
          </h2>
        </div>
      )}
      
      {/* Contenido principal en dos columnas */}
      <div className="relative h-full flex items-end z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end h-full min-h-[400px]">
            
            {/* Columna Izquierda - Contenido */}
            <div className="space-y-6 pb-16">
              {/* Logo */}
              {currentSlider.logo && (
              <div className="mb-8">
                <img 
                  src={currentSlider.logo}
                  alt="TOEIC Logo" 
                  className="h-12 md:h-16 w-auto"
                />
              </div>
              )}
              
              {/* Título */}
              <h1 className="font-open-sans font-light text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
                {language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg md:text-xl text-text-primary leading-relaxed">
                {language === 'es' ? (currentSlider.subtitulo || '') : (currentSlider.en_subtitulo || '')}
              </p>
              
              {/* Botón */}
              {currentSlider.boton_texto && currentSlider.boton_enlace && (
                <Link
                  to={currentSlider.boton_enlace}
                  className="inline-flex items-center px-8 py-4 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
                >
                  {language === 'es' ? (currentSlider.boton_texto || '') : (currentSlider.en_boton_texto || '')}
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              )}
            </div>
            
            {/* Columna Derecha - Imagen */}
            <div className="flex justify-center lg:justify-end">
              {currentSlider.imagen && (
                <div className="relative">
                  <img
                    src={currentSlider.imagen}
                    alt={language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
                    className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl"
                  />
                </div>
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-bg-light/20 hover:bg-bg-light/40 backdrop-blur-sm text-text p-3 rounded-full transition-all border border-border/30 shadow-lg z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-bg-light/20 hover:bg-bg-light/40 backdrop-blur-sm text-text p-3 rounded-full transition-all border border-border/30 shadow-lg z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary scale-125 shadow-lg' 
                    : 'bg-text-muted/50 hover:bg-text-muted/80'
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
      block_1: 'Aceptado en',
      block_2: 'Reputación',
      block_3: 'Usado por',
    },
    en: {
      block_1: 'Accepted',
      block_2: 'Reputation',
      block_3: 'Used by',
    }
  };

  const sub_texts = {
    es: {
      block_1: 'Paises',
      block_2: 'Años',
      block_3: 'Organizaciones',
    },
    en: {
      block_1: 'Contries',
      block_2: 'Years',
      block_3: 'Organitations',
    }
  };

  const currentTexts = texts[language];
  const currentSubTexts = sub_texts[language];

  const stats = [
    {
      number: '+160',
      label: currentTexts.block_1,
      sublabel: currentSubTexts.block_1,
    },
    {
      number: '+45',
      label: currentTexts.block_2,
      sublabel: currentSubTexts.block_2,
    },
    {
      number: '+14K',
      label: currentTexts.block_3,
      sublabel: currentSubTexts.block_3,
    }
  ];

  return (
    <section className="py-4 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg text-white-muted">{stat.label}</p>
              <h3 className="text-6xl font-light text-white mb-2">{stat.number}</h3>
              <p className="text-lg text-white-muted">{stat.sublabel}</p>
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
      paragraph_1: 'TOEIC® (Test of English for International Communication) es una certificación internacional que evalúa tu dominio del inglés en situaciones reales de trabajo. Es aceptada por más de 14,000 organizaciones en todo el mundo.',
      subtitle: 'Ventajas del exámen',
      paragraph_2: 'Evalúa inglés real en contextos laborales. No se reprueba: se mide tu nivel (escala de 10 a 990 puntos). Certificación válida por 2 años. Resultados rápidos y confiables. Alineado al Marco Común Europeo de Referencia (MCER).'
    },
    en: {
      title: '¿Qué es TOEIC?',
      paragraph_1: 'TOEIC® (Test of English for International Communication) es una certificación internacional que evalúa tu dominio del inglés en situaciones reales de trabajo. Es aceptada por más de 14,000 organizaciones en todo el mundo.',
      subtitle: 'Ventajas del exámen',
      paragraph_2: 'Evalúa inglés real en contextos laborales. No se reprueba: se mide tu nivel (escala de 10 a 990 puntos). Certificación válida por 2 años. Resultados rápidos y confiables. Alineado al Marco Común Europeo de Referencia (MCER).'
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <iframe 
              width="100%" 
              height="315" 
              src="https://www.youtube.com/embed/dEuxSF1Ylgs?si=dxa3KVGOdz4-Luhg" 
              title="YouTube video player" 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            />
          </div>
          <div>
          <h2 className="text-4xl font-medium text-primary mb-4">
            {currentTexts.title}
          </h2>
          <p className="text-secondary mb-6">
            {currentTexts.paragraph_1}
          </p>
          <h3 className="text-4xl font-medium text-primary mb-4">
            {currentTexts.subtitle}
          </h3>
          <p className="text-secondary">
            {currentTexts.paragraph_2}
          </p></div>
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
      title: 'Tipos de examen disponibles',
      description: 'Ofrecemos distintas opciones, puedes elegir la que más se ajuste a lo que requieres de tus empleados o que te exija tu área laboral.',
      cta: 'Puedes elegir uno o varios exámenes para probar tus habilidades. Tenemos mas opciones para que se adapten a tus necesidades.',
      viewMore: 'Ver más',
    },
    en: {
      title: 'Tipos de examen disponibles',
      description: 'Ofrecemos distintas opciones, puedes elegir la que más se ajuste a lo que requieres de tus empleados o que te exija tu área laboral.',
      cta: 'Puedes elegir uno o varios exámenes para probar tus habilidades. Tenemos mas opciones para que se adapten a tus necesidades.',
      viewMore: 'Ver más',
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
    <section className="py-16 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-medium text-primary mb-4">
            {currentTexts.title}
          </h2>
           <p className="text-secondary mb-6">
            {currentTexts.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {examenes.map((examen) => (
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
                      <div className="text-text-muted text-4xl font-bold">
                        {(language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')).charAt(0)}
                      </div>
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
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <div className="flex-1">
            <h3 className="text-3xl font-light text-primary mb-0">
              {currentTexts.cta}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={examenesLink}
              className="btn-accent px-8 py-4 whitespace-nowrap"
            >
              {currentTexts.viewMore}
            </Link>
          </div>
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
      title: '¿Qué industrias utilizan TOEIC®?'
    },
    en: {
      title: 'Wich industries use TOEIC®'
    }
  };

  const currentTexts = texts[language];

  // Logos placeholder - en producción serían logos reales
  const logos = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Partner ${i + 1}`,
    image: `https://via.placeholder.com/300x300/0F5132/FFFFFF?text=Logo+${i + 1}` // Usando color primary
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
    <section className="py-16 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-medium text-center text-primary mb-12">
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
                  <div className="bg-bg rounded-lg p-6 flex items-center justify-center h-32 hover:shadow-md transition-shadow border border-border">
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
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-bg-light shadow-lg rounded-full p-2 hover:bg-bg transition-colors border border-border"
          >
            <ChevronLeft className="w-6 h-6 text-text-muted" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-bg-light shadow-lg rounded-full p-2 hover:bg-bg transition-colors border border-border"
          >
            <ChevronRight className="w-6 h-6 text-text-muted" />
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
      title: '¡No lo pienses más!',
      description: 'Contáctanos, certifícate o certifica a tus empleados.',
      primaryButton: 'Contáctanos'
    },
    en: {
      title: 'Ready to Start Your TOEIC Assessment?',
      description: 'Find your nearest test center and schedule your TOEIC test today.',
      primaryButton: 'Contact Us',
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 gradient-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className='grid grid-cols-3 gap-8 divide-x-1 divide-solid divide-white'>
          <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {currentTexts.title}
              </h2>
          </div>
          <div className='col-span-2'>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              {currentTexts.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={generateLocalizedPath('centros', language)}
                className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
              >
                <Building2 className="mr-2 w-5 h-5" />
                {currentTexts.primaryButton}
              </Link>
            </div>
          </div>
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