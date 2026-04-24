// src/components/layout/PublicHeader.tsx - Con efecto de scroll

import { Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { generateLocalizedPath } from '../../utils/languageUtils';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      home: 'Inicio',
      about: 'Acerca de RQ',
      exams: 'Exámenes',
      preparation_material: 'Material de preparación',
      centers: 'Centros Autorizados',
      contact: 'Contacto',
    },
    en: {
      home: 'Home',
      about: 'About RQ',
      exams: 'Tests',
      preparation_material: 'Preparation material',
      centers: 'Authorized Centers',
      contact: 'Contact',
    }
  };

  const currentTexts = texts[language];

  // Generar enlaces según el idioma actual
  const links = {
    home: generateLocalizedPath('home', language),
    about: generateLocalizedPath('acerca', language),
    examenes: generateLocalizedPath('examenes', language),
    material_preparacion: generateLocalizedPath('material_preparacion', language),
    centros: generateLocalizedPath('centros', language),
    contacto: generateLocalizedPath('contacto', language),
  };

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Cambia después de 50px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      {/* Top Contact Bar - Siempre sólida */}
      <div className='max-w-full bg-primary text-white p-2 flex flex-row justify-between'>
        <div className='flex flex-row text-xs items-center'>
          <Phone size={18} className='text-xs mx-2'/> 
          (55) 5540 3555 - (55) 5540 3959 
          <Mail size={18} className='text-xs mx-2'/> 
          recepcion@toeic.mx
        </div>
        <div>
          <Facebook/>
        </div>
      </div>
      
      {/* Main Navbar - Con efecto de scroll */}
      <div className={`max-w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        isScrolled 
          ? 'bg-bg-light shadow-md border-b border-border' 
          : 'bg-transparent'
      }`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={links.home} 
            className="flex items-center space-x-3 text-xl font-bold text-primary hover:text-primary-dark transition-colors group"
          >
            <img src='/images/logo_menu.svg' className='h-18' alt="Review Quality" />
            <img src='/images/epa_logo.png' className='h-9' alt="EPA" />
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link to={links.home} className="nav-item">
              {currentTexts.home}
            </Link>
            <Link to={links.about} className="nav-item">
              {currentTexts.about}
            </Link>
            <Link to={links.examenes} className="nav-item">
              {currentTexts.exams}
            </Link>
            <Link to={links.material_preparacion} className="nav-item">
              {currentTexts.preparation_material}
            </Link>
            <Link to={links.centros} className="nav-item">
              {currentTexts.centers}
            </Link>
            <Link to={links.contacto} className="nav-item">
              {currentTexts.contact}
            </Link>
          </nav>

          {/* Desktop Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-muted hover:text-primary hover:bg-bg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden border-t animate-fade-in ${
            isScrolled ? 'border-border bg-bg-light' : 'border-white/20 bg-white/90 backdrop-blur-md'
          }`}>
            <nav className="py-4 space-y-1">
              <Link 
                to={links.home} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
                onClick={closeMenu}
              >
                {currentTexts.home}
              </Link>
              <Link 
                to={links.about} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
                onClick={closeMenu}
              >
                {currentTexts.about}
              </Link>
              <Link 
                to={links.examenes} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
                onClick={closeMenu}
              >
                {currentTexts.exams}
              </Link>
              <Link 
                to={links.material_preparacion} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
                onClick={closeMenu}
              >
                {currentTexts.preparation_material}
              </Link>
              <Link 
                to={links.centros} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
                onClick={closeMenu}
              >
                {currentTexts.centers}
              </Link>
              <Link 
                to={links.contacto} 
                className="block px-4 py-3 text-text-muted hover:text-primary hover:bg-bg transition-colors font-medium rounded-lg mx-2"
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