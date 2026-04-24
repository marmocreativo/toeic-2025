// src/components/common/WhatsAppFloat.tsx
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocation } from 'react-router-dom';

interface WhatsAppFloatProps {
  phoneNumber?: string;
  customMessage?: string;
}

export default function WhatsAppFloat({ 
  phoneNumber = '525544120209', 
  customMessage 
}: WhatsAppFloatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const location = useLocation();

  // Textos según el idioma
  const texts = {
    es: {
      tooltip: 'Contáctanos por WhatsApp',
      title: '¿Necesitas ayuda?',
      subtitle: 'Envíanos un mensaje',
      button: 'Enviar mensaje',
      close: 'Cerrar',
    },
    en: {
      tooltip: 'Contact us on WhatsApp',
      title: 'Need help?',
      subtitle: 'Send us a message',
      button: 'Send message',
      close: 'Close',
    }
  };

  const currentTexts = texts[language];

  // Generar mensaje según la página actual
  const generateMessage = (): string => {
    if (customMessage) {
      return customMessage;
    }

    const defaultMessages = {
      es: {
        default: 'Me gustarían informes sobre los exámenes TOEIC®',
        examenes: 'Me gustaría información específica sobre el examen TOEIC®',
        centros: 'Me gustaría conocer los centros autorizados para el examen TOEIC®',
        newsletters: 'Me interesa recibir información sobre los boletines TOEIC®',
        paginas: 'Me gustaría más información sobre los servicios TOEIC®',
      },
      en: {
        default: 'I would like information about TOEIC®exams',
        examenes: 'I would like specific information about the TOEIC®exam',
        centros: 'I would like to know about authorized TOEIC®centers',
        newsletters: 'I am interested in receiving information about TOEIC®newsletters',
        paginas: 'I would like more information about TOEIC®services',
      }
    };

    const messages = defaultMessages[language];
    const path = location.pathname.toLowerCase();

    if (path.includes('examenes') || path.includes('exams')) {
      return messages.examenes;
    }
    if (path.includes('centros') || path.includes('centers')) {
      return messages.centros;
    }
    if (path.includes('newsletters') || path.includes('boletines')) {
      return messages.newsletters;
    }
    if (path.includes('paginas') || path.includes('pages')) {
      return messages.paginas;
    }

    return messages.default;
  };

  const handleWhatsAppClick = () => {
    console.log('click en el botón');
    const message = encodeURIComponent(generateMessage());
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsExpanded(false);
  };

  return (
    <>
      {/* Overlay para cerrar cuando está expandido */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Contenedor principal */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Card expandida */}
        {isExpanded && (
          <div className="mb-4 bg-white rounded-lg shadow-xl border p-4 w-64 transform animate-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {currentTexts.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {currentTexts.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label={currentTexts.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensaje preview */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border-l-4 border-green-500">
                {generateMessage()}
              </div>
            </div>

            {/* Botón de envío */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentTexts.button}</span>
            </button>
          </div>
        )}

        {/* Botón flotante principal */}
        <div className="relative group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full 
              shadow-lg hover:shadow-xl transition-all duration-300 
              flex items-center justify-center group-hover:scale-110
              ${isExpanded ? 'rotate-180' : ''}
            `}
            aria-label={currentTexts.tooltip}
          >
            {isExpanded ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </button>

          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {currentTexts.tooltip}
              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}