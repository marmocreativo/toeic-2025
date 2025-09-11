// src/components/CallToAction.tsx
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';

// Variantes de animación
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

// Hook para animaciones de scroll
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

interface CallToActionProps {
  title?: {
    es: string;
    en: string;
  };
  description?: {
    es: string;
    en: string;
  };
  primaryButton?: {
    es: string;
    en: string;
  };
  linkTo?: string;
  customIcon?: React.ReactNode;
  className?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  primaryButton,
  linkTo,
  customIcon,
  className = ""
}) => {
  const { language } = useLanguage();
  const { ref, controls } = useScrollAnimation();

  // Textos por defecto
  const defaultTexts = {
    es: {
      title: '¡No lo pienses más!',
      description: 'Desarrollando las habilidades de comunicación en inglés más efectivas para la fuerza laboral.',
      primaryButton: 'Contáctanos'
    },
    en: {
      title: 'Ready to Start Your TOEIC Assessment?',
      description: 'Building the most effective English communication skills for the workforce.',
      primaryButton: 'Contact Us',
    }
  };

  // Usar textos personalizados o por defecto
  const currentTexts = {
    title: title ? title[language] : defaultTexts[language].title,
    description: description ? description[language] : defaultTexts[language].description,
    primaryButton: primaryButton ? primaryButton[language] : defaultTexts[language].primaryButton
  };

  // Link por defecto o personalizado
  const defaultLink = generateLocalizedPath('contacto', language);
  const buttonLink = linkTo || defaultLink;

  // Icono por defecto o personalizado
  const buttonIcon = customIcon || <Building2 className="mr-2 w-5 h-5" />;

  return (
    <motion.section 
      ref={ref}
      className={`py-16 gradient-primary relative overflow-hidden ${className}`}
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
          className='grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white'
          variants={staggerContainer}
        >
          <motion.div variants={fadeInLeft}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentTexts.title}
            </h2>
          </motion.div>
          <motion.div 
            className='md:col-span-2'
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
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={buttonLink}
                  className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    {buttonIcon}
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

export default CallToAction;