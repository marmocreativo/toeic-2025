import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../types/language';
import { 
  getLanguageFromPath, 
  getStoredLanguage, 
  setStoredLanguage,
  getAlternateLanguagePath 
} from '../utils/languageUtils';

export const useLanguage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>(() => {
    return getLanguageFromPath(location.pathname) || getStoredLanguage();
  });

  // Cambiar idioma
  const changeLanguage = (newLanguage: Language) => {
    setStoredLanguage(newLanguage);
    setLanguage(newLanguage);
    
    // Navegar a la misma página en el nuevo idioma
    const newPath = getAlternateLanguagePath(location.pathname, newLanguage);
    navigate(newPath, { replace: true });
  };

  // Actualizar idioma cuando cambie la URL
  useEffect(() => {
    const urlLanguage = getLanguageFromPath(location.pathname);
    if (urlLanguage !== language) {
      setLanguage(urlLanguage);
      setStoredLanguage(urlLanguage);
    }
  }, [location.pathname, language]);

  return {
    language,
    changeLanguage,
    isSpanish: language === 'es',
    isEnglish: language === 'en',
  };
};