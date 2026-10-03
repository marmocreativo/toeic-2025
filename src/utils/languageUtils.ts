import type { Language, RouteConfig } from '../types/language';

export const DEFAULT_LANGUAGE: Language = 'es';
export const SUPPORTED_LANGUAGES: Language[] = ['es', 'en'];

// Detectar idioma del navegador
export const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0] as Language;
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
};

// Obtener idioma desde localStorage
export const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('language') as Language;
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
};

// Guardar idioma en localStorage
export const setStoredLanguage = (lang: Language): void => {
  localStorage.setItem('language', lang);
};

// Extraer idioma de la URL
export const getLanguageFromPath = (pathname: string): Language => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Si la primera parte de la URL es un idioma soportado
  if (SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }
  
  return DEFAULT_LANGUAGE;
};

// Obtener ruta sin el prefijo de idioma
export const getPathWithoutLanguage = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
};

// Mapeo de rutas por idioma
export const ROUTE_MAPPINGS: Record<string, RouteConfig> = {
  home: {
    es: '/',
    en: '/',
  },
  examenes: {
    es: '/examenes',
    en: '/tests',
  },
  examen_detalle: {
    es: '/examen/:url',
    en: '/test/:url',
  },
   material_preparacion: {
    es: '/material_preparacion',
    en: '/preparation_material',
  },
  paginas: {
    es: '/paginas',
    en: '/pages',
  },
  pagina_detalle: {
    es: '/pagina/:url',
    en: '/page/:url',
  },
  newsletters: {
    es: '/newsletters',
    en: '/newsletters',
  },
  newsletter_detalle: {
    es: '/newsletter/:id',
    en: '/newsletter/:id',
  },
  centros: {
    es: '/centros-autorizados',
    en: '/authorized-centers',
  },
  contacto: {
    es: '/contacto',
    en: '/contact',
  },
  acerca: {
    es: '/acerca-de',
    en: '/about',
  },
  comentarios: {
    es: '/comentarios-examinado',
    en: '/candidate-comment-form',
  },
};

// Generar URL para un idioma específico
export const generateLocalizedPath = (
  routeKey: string, 
  language: Language, 
  params?: Record<string, string>
): string => {
  const route = ROUTE_MAPPINGS[routeKey];
  if (!route) return '/';
  
  let path = route[language];
  
  // Reemplazar parámetros si existen
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  
  // No agregar prefijo para español (idioma por defecto)
  if (language === 'es') {
    return path;
  }
  
  // Agregar prefijo para inglés
  return `/en${path}`;
};

// Obtener ruta actual en otro idioma
export const getAlternateLanguagePath = (
  currentPath: string,
  targetLanguage: Language
): string => {
  const currentLang = getLanguageFromPath(currentPath);
  const pathWithoutLang = getPathWithoutLanguage(currentPath);
  
  // Buscar la ruta correspondiente
  for (const [routeKey, config] of Object.entries(ROUTE_MAPPINGS)) {
    const currentRoute = config[currentLang];
    
    // Comparar rutas sin parámetros
    const currentRoutePattern = currentRoute.replace(/:[\w]+/g, '([^/]+)');
    const regex = new RegExp(`^${currentRoutePattern}$`);
    
    if (regex.test(pathWithoutLang)) {
      // Extraer parámetros de la URL actual
      const matches = pathWithoutLang.match(regex);
      const params: Record<string, string> = {};
      
      if (matches) {
        const paramNames = currentRoute.match(/:[\w]+/g) || [];
        paramNames.forEach((paramName: string, index: number) => {
          const cleanParamName = paramName.replace(':', '');
          params[cleanParamName] = matches[index + 1];
        });
      }
      
      return generateLocalizedPath(routeKey, targetLanguage, params);
    }
  }
  
  // Si no se encuentra, retornar home
  return generateLocalizedPath('home', targetLanguage);
};