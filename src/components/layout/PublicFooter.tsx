// src/components/layout/PublicFooter.tsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function PublicFooter() {
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'TOEIC 2025',
      description: 'Tu portal oficial para información sobre exámenes TOEIC en México.',
      quickLinks: 'Enlaces Rápidos',
      contact: 'Contacto',
      followUs: 'Síguenos',
      rights: 'Todos los derechos reservados.',
      home: 'Inicio',
      exams: 'Exámenes',
      pages: 'Páginas',
      newsletters: 'Boletines',
      centers: 'Centros Autorizados',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
    },
    en: {
      title: 'TOEIC 2025',
      description: 'Your official portal for TOEIC exam information in Mexico.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      followUs: 'Follow Us',
      rights: 'All rights reserved.',
      home: 'Home',
      exams: 'Tests',
      pages: 'Pages',
      newsletters: 'Newsletters',
      centers: 'Authorized Centers',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
    }
  };

  const currentTexts = texts[language];

  // Generar enlaces según el idioma actual
  const links = {
    home: generateLocalizedPath('home', language),
    examenes: generateLocalizedPath('examenes', language),
    paginas: generateLocalizedPath('paginas', language),
    newsletters: generateLocalizedPath('newsletters', language),
    centros: generateLocalizedPath('centros', language),
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              {currentTexts.title}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {currentTexts.description}
            </p>
            
            {/* Información de contacto */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>info@toeic2025.mx</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>+52 55 1234 5678</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">
              {currentTexts.quickLinks}
            </h4>
            <nav className="space-y-3">
              <Link 
                to={links.home}
                className="block text-gray-300 hover:text-white hover:text-blue-400 transition-colors"
              >
                {currentTexts.home}
              </Link>
              <Link 
                to={links.examenes}
                className="block text-gray-300 hover:text-white hover:text-blue-400 transition-colors"
              >
                {currentTexts.exams}
              </Link>
              <Link 
                to={links.paginas}
                className="block text-gray-300 hover:text-white hover:text-blue-400 transition-colors"
              >
                {currentTexts.pages}
              </Link>
              <Link 
                to={links.newsletters}
                className="block text-gray-300 hover:text-white hover:text-blue-400 transition-colors"
              >
                {currentTexts.newsletters}
              </Link>
              <Link 
                to={links.centros}
                className="block text-gray-300 hover:text-white hover:text-blue-400 transition-colors"
              >
                {currentTexts.centers}
              </Link>
            </nav>
          </div>

          {/* Redes sociales y enlaces externos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">
              {currentTexts.followUs}
            </h4>
            <div className="space-y-3">
              <a 
                href="https://www.ets.org/toeic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>ETS TOEIC Official</span>
              </a>
              <a 
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>
              <a 
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 TOEIC 2025. {currentTexts.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}