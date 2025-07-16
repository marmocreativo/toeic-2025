// src/components/layout/PublicHeader.tsx - Versión completa actualizada

import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { generateLocalizedPath } from '../../utils/languageUtils';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      home: 'Inicio',
      exams: 'Exámenes',
      pages: 'Páginas',
      newsletters: 'Boletines',
      centers: 'Centros Autorizados',
      contact: 'Contacto',
    },
    en: {
      home: 'Home',
      exams: 'Tests',
      pages: 'Pages',
      newsletters: 'Newsletters',
      centers: 'Authorized Centers',
      contact: 'Contact',
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
    contacto: generateLocalizedPath('contacto', language),
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={links.home} 
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            TOEIC 2025
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to={links.home} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.home}
            </Link>
            <Link 
              to={links.examenes} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.exams}
            </Link>
            <Link 
              to={links.paginas} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.pages}
            </Link>
            <Link 
              to={links.newsletters} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.newsletters}
            </Link>
            <Link 
              to={links.centros} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.centers}
            </Link>
            <Link 
              to={links.contacto} 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {currentTexts.contact}
            </Link>
          </nav>

          {/* Desktop Language Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher - Always visible */}
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <nav className="py-4 space-y-1">
              <Link 
                to={links.home} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.home}
              </Link>
              <Link 
                to={links.examenes} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.exams}
              </Link>
              <Link 
                to={links.paginas} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.pages}
              </Link>
              <Link 
                to={links.newsletters} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.newsletters}
              </Link>
              <Link 
                to={links.centros} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.centers}
              </Link>
              <Link 
                to={links.contacto} 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-md"
                onClick={closeMenu}
              >
                {currentTexts.contact}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}