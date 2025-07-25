// src/pages/public/Home.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
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

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};



// ============================================================================
// HOOK PARA SCROLL ANIMATIONS
// ============================================================================

const useScrollAnimation = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    }
  }, [controls, isInView]);

  return { ref, controls };
};

// ============================================================================
// INTERFACES DE TYPESCRIPT
// ============================================================================

interface AnimatedCounterProps {
  value: string;
  suffix?: string;
  duration?: number;
}

// ============================================================================
// COMPONENTE DE CONTADOR ANIMADO
// ============================================================================

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = parseInt(value.replace(/[^0-9]/g, ''));

      const updateCount = () => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
        
        setCount(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      
      requestAnimationFrame(updateCount);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {value.includes('+') ? '+' : ''}{count}{suffix}
    </span>
  );
};

// ============================================================================
// COMPONENTE DE SLIDER PRINCIPAL
// ============================================================================

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
      <motion.section 
        className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden -mt-16"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Background animado */}
        <motion.div 
          className="absolute inset-0 bg-gradient-radial from-bg-light from-40% to-bg-dark to-90%" 
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, hsl(0 0% 100%) 40%, hsl(0 0% 95%) 90%)",
              "radial-gradient(circle at 80% 50%, hsl(0 0% 100%) 40%, hsl(0 0% 95%) 90%)",
              "radial-gradient(circle at 20% 50%, hsl(0 0% 100%) 40%, hsl(0 0% 95%) 90%)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="relative h-full flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full min-h-[400px]">
              <motion.div className="space-y-6" variants={staggerContainer}>
                <motion.div className="mb-8" variants={staggerItem}>
                  <img 
                    src="./images/logo.png" 
                    alt="TOEIC Logo" 
                    className="h-12 md:h-16 w-auto"
                  />
                </motion.div>
                <motion.h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-text leading-tight"
                  variants={staggerItem}
                >
                  TOEIC 2025
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl text-text-muted leading-relaxed"
                  variants={staggerItem}
                >
                  Tu camino hacia el éxito profesional
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  const currentSlider = sliders[currentSlide];

  return (
    <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden -mt-16">
      {/* Background animado */}
      <motion.div 
        className="absolute inset-0" 
        animate={{
          background: [
            "radial-gradient(ellipse at center, #f4f4f5, #d4d4d4)",
            "radial-gradient(ellipse at 30% 40%, #f4f4f5, #d4d4d4)",
            "radial-gradient(ellipse at 70% 60%, #f4f4f5, #d4d4d4)",
            "radial-gradient(ellipse at center, #f4f4f5, #d4d4d4)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full"
        >
          {/* Texto extra como fondo */}
          {currentSlider.extra && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-64"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="font-open-sans text-6xl md:text-8xl lg:text-9xl font-black text-white/60 select-none text-center leading-none">
                {language === 'es' ? (currentSlider.extra || '') : (currentSlider.en_extra || '')}
              </h2>
            </motion.div>
          )}
          
          {/* Contenido principal */}
          <div className="relative h-full flex items-end z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end h-full min-h-[400px]">
                
                {/* Columna Izquierda - Contenido */}
                <motion.div 
                  className="space-y-6 pb-16"
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                >
                  {/* Logo */}
                  {currentSlider.logo && (
                    <motion.div className="mb-8" variants={fadeInLeft}>
                      <img 
                        src={currentSlider.logo}
                        alt="TOEIC Logo" 
                        className="h-12 md:h-16 w-auto"
                      />
                    </motion.div>
                  )}
                  
                  {/* Título */}
                  <motion.h1 
                    className="font-open-sans font-light text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight"
                    variants={fadeInUp}
                  >
                    {language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
                  </motion.h1>
                  
                  {/* Subtítulo */}
                  <motion.p 
                    className="text-lg md:text-xl text-text-primary leading-relaxed"
                    variants={fadeInUp}
                  >
                    {language === 'es' ? (currentSlider.subtitulo || '') : (currentSlider.en_subtitulo || '')}
                  </motion.p>
                  
                  {/* Botón */}
                  {currentSlider.boton_texto && currentSlider.boton_enlace && (
                    <motion.div variants={fadeInUp}>
                      <Link
                        to={currentSlider.boton_enlace}
                        className="inline-flex items-center px-8 py-4 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
                      >
                        <motion.span
                          whileHover={{ x: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {language === 'es' ? (currentSlider.boton_texto || '') : (currentSlider.en_boton_texto || '')}
                        </motion.span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="ml-3 w-5 h-5" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Columna Derecha - Imagen */}
                <motion.div 
                  className="flex justify-center lg:justify-end"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {currentSlider.imagen && (
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={currentSlider.imagen}
                        alt={language === 'es' ? (currentSlider.titulo || '') : (currentSlider.en_titulo || '')}
                        className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {sliders.length > 1 && (
        <>
          <motion.button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-bg-light/20 hover:bg-bg-light/40 backdrop-blur-sm text-text p-3 rounded-full transition-all border border-border/30 shadow-lg z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-bg-light/20 hover:bg-bg-light/40 backdrop-blur-sm text-text p-3 rounded-full transition-all border border-border/30 shadow-lg z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {sliders.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary scale-125 shadow-lg' 
                    : 'bg-text-muted/50 hover:bg-text-muted/80'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// ============================================================================
// COMPONENTE DE NUMERALIA
// ============================================================================

const StatsSection = () => {
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

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
    <motion.section 
      ref={ref}
      className="py-4 bg-primary text-white"
      initial="initial"
      animate={controls}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              variants={staggerItem}
            >
              <motion.p 
                className="text-lg text-white-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {stat.label}
              </motion.p>
              <motion.h3 
                className="text-6xl font-light text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 100 }}
              >
                <AnimatedCounter value={stat.number} />
              </motion.h3>
              <motion.p 
                className="text-lg text-white-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {stat.sublabel}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// COMPONENTE ¿QUÉ ES TOEIC?
// ============================================================================

const AboutToeicSection = () => {
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

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
    <motion.section 
      ref={ref}
      className="py-16 bg-bg-light"
      initial="initial"
      animate={controls}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-2 gap-8"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInLeft}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <iframe 
                width="100%" 
                height="315" 
                src="https://www.youtube.com/embed/dEuxSF1Ylgs?si=dxa3KVGOdz4-Luhg" 
                title="YouTube video player" 
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>
          <motion.div variants={fadeInRight}>
            <motion.h2 
              className="text-4xl font-medium text-primary mb-4"
              variants={fadeInUp}
            >
              {currentTexts.title}
            </motion.h2>
            <motion.p 
              className="text-secondary mb-6"
              variants={fadeInUp}
            >
              {currentTexts.paragraph_1}
            </motion.p>
            <motion.h3 
              className="text-4xl font-medium text-primary mb-4"
              variants={fadeInUp}
            >
              {currentTexts.subtitle}
            </motion.h3>
            <motion.p 
              className="text-secondary"
              variants={fadeInUp}
            >
              {currentTexts.paragraph_2}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// COMPONENTE DE EXÁMENES
// ============================================================================

const ExamsSection = () => {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

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
    <motion.section 
      ref={ref}
      className="py-16 bg-bg"
      initial="initial"
      animate={controls}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-4xl font-medium text-primary mb-4">
            {currentTexts.title}
          </h2>
          <p className="text-secondary mb-6">
            {currentTexts.description}
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
          variants={staggerContainer}
        >
          {examenes.map((examen, _index) => (
            <motion.div
              key={examen.id}
              variants={staggerItem}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)" 
              }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                className="exam-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer block"
              >
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Columna Izquierda - Imagen */}
                  <motion.div 
                    className="col-span-5"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                  
                  {/* Columna Derecha - Contenido */}
                  <div className="col-span-7 flex flex-col justify-center p-4">
                    <motion.h3 
                      className="text-lg font-semibold text-text mb-3 leading-tight"
                      whileHover={{ color: "hsl(150 77% 17%)" }}
                      transition={{ duration: 0.2 }}
                    >
                      {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                    </motion.h3>
                    <p className="text-text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                      {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="flex items-center gap-8"
          variants={fadeInUp}
        >
          <div className="flex-1">
            <h3 className="text-3xl font-light text-primary mb-0">
              {currentTexts.cta}
            </h3>
          </div>
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={examenesLink}
              className="btn-accent px-8 py-4 whitespace-nowrap"
            >
              {currentTexts.viewMore}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// COMPONENTE CARRUSEL DE LOGOS
// ============================================================================

const PartnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

  const texts = {
    es: {
      title: '¿Qué industrias utilizan TOEIC®?'
    },
    en: {
      title: 'Wich industries use TOEIC®'
    }
  };

  const currentTexts = texts[language];

  // Logos placeholder
  const logos = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Partner ${i + 1}`,
    image: `https://via.placeholder.com/300x300/0F5132/FFFFFF?text=Logo+${i + 1}`
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
    <motion.section 
      ref={ref}
      className="py-16 bg-bg-light"
      initial="initial"
      animate={controls}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-medium text-center text-primary mb-12"
          variants={fadeInUp}
        >
          {currentTexts.title}
        </motion.h2>
        
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-500 ease-in-out"
              animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {logos.map((logo, index) => (
                <motion.div 
                  key={logo.id} 
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsToShow}%` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className="bg-bg rounded-lg p-6 flex items-center justify-center h-32 hover:shadow-md transition-shadow border border-border"
                    whileHover={{ 
                      y: -5, 
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)" 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={logo.image}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <motion.button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-bg-light shadow-lg rounded-full p-2 hover:bg-bg transition-colors border border-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-text-muted" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-bg-light shadow-lg rounded-full p-2 hover:bg-bg transition-colors border border-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 text-text-muted" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// COMPONENTE DE LLAMADA A LA ACCIÓN
// ============================================================================

const CallToActionSection = () => {
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

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
    <motion.section 
      ref={ref}
      className="py-16 gradient-primary relative overflow-hidden"
      initial="initial"
      animate={controls}
      variants={staggerContainer}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"
        animate={{
          x: [-100, 100],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className='grid grid-cols-3 gap-8 divide-x-1 divide-solid divide-white'
          variants={staggerContainer}
        >
          <motion.div variants={fadeInLeft}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentTexts.title}
            </h2>
          </motion.div>
          <motion.div 
            className='col-span-2'
            variants={fadeInRight}
          >
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              {currentTexts.description}
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={staggerContainer}
            >
              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={generateLocalizedPath('centros', language)}
                  className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Building2 className="mr-2 w-5 h-5" />
                  </motion.div>
                  {currentTexts.primaryButton}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL HOME
// ============================================================================

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSlider />
      <StatsSection />
      <AboutToeicSection />
      <ExamsSection />
      <PartnersCarousel />
      <CallToActionSection />
    </motion.div>
  );
}