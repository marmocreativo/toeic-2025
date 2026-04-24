// src/components/layout/PublicFooter.tsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function PublicFooter() {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Review Quality',
      description: 'Somos distribuidores autorizados de exámenes TOEIC® en México, comprometidos con la evaluación objetiva y confiable del idioma inglés para el sector académico y corporativo.',
      quickLinks: 'Enlaces Rápidos',
      contact: 'Contacto',
      followUs: 'Síguenos',
      rights: 'Todos los derechos reservados.',
      home: 'Inicio',
      about: 'Acerca de',
      exams: 'Exámenes',
      pages: 'Páginas',
      newsletters: 'Boletines',
      centers: 'Centros Autorizados',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
      trademark: 'TOEIC® es una marca registrada de ETS en Estados Unidos y otros países, utilizada bajo licencia en México. ETS no es responsable del contenido de este sitio.',
      responsibility: 'Review Quality es enteramente responsable del contenido de este sitio web.',
    },
    en: {
      title: 'Review Quality',
      description: 'We are authorized distributors of TOEIC® exams in Mexico, committed to the objective and reliable assessment of the English language for the academic and corporate sectors.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      followUs: 'Follow Us',
      rights: 'All rights reserved.',
      home: 'Home',
      about: 'About',
      exams: 'Tests',
      pages: 'Pages',
      newsletters: 'Newsletters',
      centers: 'Authorized Centers',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      trademark: 'TOEIC® is a registered trademark of ETS in the United States and other countries, used under license in Mexico. ETS is not responsible for the content of this website.',
      responsibility: 'Review Quality is entirely responsible for the content of this website.',
    }
  };

  const currentTexts = texts[language];

  const links = {
    home: generateLocalizedPath('home', language),
    acerca: generateLocalizedPath('acerca', language),
    examenes: generateLocalizedPath('examenes', language),
    paginas: generateLocalizedPath('paginas', language),
    newsletters: generateLocalizedPath('newsletters', language),
    centros: generateLocalizedPath('centros', language),
  };

  return (
    <>
      <footer className="bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Información de la empresa */}
            <div className="lg:col-span-2">
              {/* Logos */}
              <div className="flex items-center gap-6 mb-6">
                <img
                  src="/images/logo.png"
                  alt="Review Quality"
                  className="h-10 w-auto brightness-0 invert"
                />
                <img
                  src="/images/epa_logo.png"
                  alt="ETS Preferred Associate"
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {currentTexts.description}
              </p>

              {/* Información de contacto */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-white flex-shrink-0" />
                  <span>recepcion@reviewquality.mx</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 text-white flex-shrink-0" />
                  <span>(55) 5540 3555 - (55) 5540 3959</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>GAUSS NO. 9 INT. 103 C, COLONIA ANZURES, DEL. MIGUEL HIDALGO, CIUDAD DE MÉXICO, C.P. 11590.</span>
                </div>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {currentTexts.quickLinks}
              </h4>
              <nav className="space-y-3">
                <Link to={links.home} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.home}
                </Link>
                <Link to={links.acerca} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.about}
                </Link>
                <Link to={links.examenes} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.exams}
                </Link>
                <Link to={links.paginas} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.pages}
                </Link>
                <Link to={links.newsletters} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.newsletters}
                </Link>
                <Link to={links.centros} className="block text-gray-300 hover:text-white transition-colors">
                  {currentTexts.centers}
                </Link>
              </nav>
            </div>

            {/* Redes sociales y enlaces externos */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {currentTexts.followUs}
              </h4>
              <div className="space-y-3">
                <a
                  href="https://www.ets.org/toeic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ETS TOEIC®Official</span>
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Leyendas legales y copyright */}
      <div className="bg-secondary border-t border-primary/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 text-center">
          <p className="text-gray-400 text-xs leading-relaxed">
            {currentTexts.trademark}
          </p>
          <p className="text-gray-400 text-xs">
            {currentTexts.responsibility}
          </p>
          <p className="text-gray-300 text-sm pt-2">
            &copy; {new Date().getFullYear()} Review Quality. {currentTexts.rights}
          </p>
        </div>
      </div>
    </>
  );
}