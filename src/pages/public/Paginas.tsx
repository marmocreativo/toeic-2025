// src/pages/public/Paginas.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { paginaService } from '../../services/paginaService';
import type { Pagina } from '../../types/pagina';
import  CallToAction from '../../components/public/CallToAction';
import { 
  FileText, 
  Search, 
  ArrowRight, 
  Calendar,
  Clock
} from 'lucide-react';

export default function Paginas() {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [filteredPaginas, setFilteredPaginas] = useState<Pagina[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'Páginas de Información',
      subtitle: 'Encuentra toda la información que necesitas sobre TOEIC',
      searchPlaceholder: 'Buscar páginas...',
      noResults: 'No se encontraron páginas',
      noResultsDesc: 'Intenta con otros términos de búsqueda',
      readMore: 'Leer Más',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes disponibles o encuentra un centro autorizado cerca de ti.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros',
      lastUpdated: 'Actualizado',
      clearSearch: 'Limpiar Búsqueda',
      resultsCount: 'páginas encontradas',
      resultsSingle: 'página encontrada',
      features: {
        comprehensive: 'Información Completa',
        updated: 'Siempre Actualizada',
        multilingual: 'Contenido Bilingüe'
      }
    },
    en: {
      title: 'Information Pages',
      subtitle: 'Find all the information you need about TOEIC',
      searchPlaceholder: 'Search pages...',
      noResults: 'No pages found',
      noResultsDesc: 'Try different search terms',
      readMore: 'Read More',
      ctaTitle: 'Can\'t Find What You\'re Looking For?',
      ctaDescription: 'Explore our available tests or find an authorized center near you.',
      ctaButton: 'View Tests',
      ctaSecondary: 'Find Centers',
      lastUpdated: 'Updated',
      clearSearch: 'Clear Search',
      resultsCount: 'pages found',
      resultsSingle: 'page found',
      features: {
        comprehensive: 'Comprehensive Information',
        updated: 'Always Updated',
        multilingual: 'Bilingual Content'
      }
    }
  };

  const currentTexts = texts[language];

  // Cargar páginas
  useEffect(() => {
    const loadPaginas = async () => {
      try {
        setLoading(true);
        const data = await paginaService.getPaginas();
        const publicPaginas = data.filter(pagina => pagina.publicado);
        setPaginas(publicPaginas);
        setFilteredPaginas(publicPaginas);
      } catch (error) {
        console.error('Error loading paginas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPaginas();
  }, []);

  // Filtrar páginas por término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPaginas(paginas);
    } else {
      const filtered = paginas.filter(pagina => {
        const titulo = language === 'es' ? pagina.titulo : pagina.en_titulo;
        const resumen = language === 'es' ? pagina.resumen : pagina.en_resumen;
        const contenido = language === 'es' ? pagina.contenido : pagina.en_contenido;
        
        const searchText = searchTerm.toLowerCase();
        return (
          (titulo && titulo.toLowerCase().includes(searchText)) ||
          (resumen && resumen.toLowerCase().includes(searchText)) ||
          (contenido && contenido.toLowerCase().includes(searchText))
        );
      });
      setFilteredPaginas(filtered);
    }
  }, [searchTerm, paginas, language]);

  // Formato de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Componente de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-border rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-bg-light rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-border"></div>
                  <div className="p-6">
                    <div className="h-6 bg-border rounded mb-2"></div>
                    <div className="h-4 bg-border rounded mb-4"></div>
                    <div className="h-4 bg-border rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="gradient-hero text-primary py-16 -mt-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-4">
              {currentTexts.title}
            </h1>
            <p className="text-xl md:text-2xl text-primary/90 mb-8 max-w-3xl mx-auto">
              {currentTexts.subtitle}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder={currentTexts.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-light border border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Páginas Grid */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-secondary">
              {filteredPaginas.length} {filteredPaginas.length === 1 ? currentTexts.resultsSingle : currentTexts.resultsCount}
            </p>
          </div>

          {/* Grid de Páginas */}
          {filteredPaginas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPaginas.map((pagina) => (
                <div 
                  key={pagina.id} 
                  className="bg-bg-light rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-border"
                >
                  {/* Imagen */}
                  {pagina.imagen ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pagina.imagen}
                        alt={language === 'es' ? (pagina.titulo || '') : (pagina.en_titulo || '')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 gradient-secondary flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text mb-3 group-hover:text-primary transition-colors">
                      {language === 'es' ? (pagina.titulo || '') : (pagina.en_titulo || '')}
                    </h3>
                    
                    <p className="text-text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                      {language === 'es' ? (pagina.resumen || '') : (pagina.en_resumen || '')}
                    </p>

                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{currentTexts.lastUpdated}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(pagina.updated_at || pagina.created_at)}</span>
                      </div>
                    </div>

                    {/* Botón */}
                    <Link
                      to={generateLocalizedPath('pagina_detalle', language, { 
                        url: language === 'es' ? (pagina.url || '') : (pagina.en_url || pagina.url || '')
                      })}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors group"
                    >
                      {currentTexts.readMore}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-border mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">
                {currentTexts.noResults}
              </h3>
              <p className="text-text-muted mb-6">
                {currentTexts.noResultsDesc}
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="btn-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                {currentTexts.clearSearch}
              </button>
            </div>
          )}
        </div>
      </section>

      <CallToAction />
    </div>
  );
}