// src/pages/public/Newsletters.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { getNewsletters } from '../../services/newsletterService';
import type { Newsletter } from '../../types/newsletter';
import { 
  FileText, 
  Search, 
  Download,
  Calendar,
  Eye,
  Building2,
  BookOpen,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'Boletines TOEIC',
      subtitle: 'Mantente actualizado con las últimas noticias y recursos de TOEIC',
      searchPlaceholder: 'Buscar boletines...',
      noResults: 'No se encontraron boletines',
      noResultsDesc: 'Intenta con otros términos de búsqueda',
      download: 'Descargar PDF',
      viewDetails: 'Ver Detalles',
      publishedOn: 'Publicado el',
      clearSearch: 'Limpiar Búsqueda',
      resultsCount: 'boletines encontrados',
      resultsSingle: 'boletín encontrado',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes disponibles o encuentra un centro autorizado cerca de ti.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros',
      features: {
        updated: 'Contenido Actualizado',
        official: 'Información Oficial',
        free: 'Descarga Gratuita'
      }
    },
    en: {
      title: 'TOEIC Newsletters',
      subtitle: 'Stay updated with the latest TOEIC news and resources',
      searchPlaceholder: 'Search newsletters...',
      noResults: 'No newsletters found',
      noResultsDesc: 'Try different search terms',
      download: 'Download PDF',
      viewDetails: 'View Details',
      publishedOn: 'Published on',
      clearSearch: 'Clear Search',
      resultsCount: 'newsletters found',
      resultsSingle: 'newsletter found',
      ctaTitle: 'Looking for More Resources?',
      ctaDescription: 'Explore our available tests or find an authorized center near you.',
      ctaButton: 'View Tests',
      ctaSecondary: 'Find Centers',
      features: {
        updated: 'Updated Content',
        official: 'Official Information',
        free: 'Free Download'
      }
    }
  };

  const currentTexts = texts[language];

  // Cargar newsletters
  useEffect(() => {
    const loadNewsletters = async () => {
      try {
        setLoading(true);
        const data = await getNewsletters();
        const publicNewsletters = data.filter(newsletter => newsletter.publicado);
        setNewsletters(publicNewsletters);
        setFilteredNewsletters(publicNewsletters);
      } catch (error) {
        console.error('Error loading newsletters:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNewsletters();
  }, []);

  // Filtrar newsletters por término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNewsletters(newsletters);
    } else {
      const filtered = newsletters.filter(newsletter => {
        const searchText = searchTerm.toLowerCase();
        return (
          newsletter.titulo.toLowerCase().includes(searchText) ||
          (newsletter.descripcion && newsletter.descripcion.toLowerCase().includes(searchText))
        );
      });
      setFilteredNewsletters(filtered);
    }
  }, [searchTerm, newsletters]);

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

      {/* Features Bar */}
      <section className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x-1 divide-solid divide-white">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.updated}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.official}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Download className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.free}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletters Grid */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-secondary">
              {filteredNewsletters.length} {filteredNewsletters.length === 1 ? currentTexts.resultsSingle : currentTexts.resultsCount}
            </p>
          </div>

          {/* Grid de Newsletters */}
          {filteredNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNewsletters.map((newsletter) => (
                <div 
                  key={newsletter.id} 
                  className="bg-bg-light rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-border"
                >
                  {/* Header con icono PDF */}
                  <div className="h-48 gradient-accent flex items-center justify-center relative">
                    <FileText className="w-20 h-20 text-black opacity-80" />
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
                      <Download className="w-5 h-5 text-black" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/10 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm font-medium text-black">PDF</span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text mb-3 group-hover:text-primary transition-colors">
                      {newsletter.titulo}
                    </h3>
                    
                    {newsletter.descripcion && (
                      <p className="text-text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                        {newsletter.descripcion}
                      </p>
                    )}

                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{currentTexts.publishedOn}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(newsletter.fecha_publicacion)}</span>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="space-y-2">
                      {newsletter.archivo && (
                        <a 
                          href={newsletter.archivo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {currentTexts.download}
                        </a>
                      )}
                      
                      <Link 
                        to={generateLocalizedPath('newsletter_detalle', language, { id: newsletter.id.toString() })}
                        className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-colors group"
                      >
                        {currentTexts.viewDetails}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
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

      {/* Call to Action */}
      <section className="py-16 gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 divide-x-1 divide-solid divide-white">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {currentTexts.ctaTitle}
              </h2>
            </div>
            <div className="col-span-2">
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                {currentTexts.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={generateLocalizedPath('examenes', language)}
                  className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
                >
                  <BookOpen className="mr-2 w-5 h-5" />
                  {currentTexts.ctaButton}
                </Link>
                <Link
                  to={generateLocalizedPath('centros', language)}
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  {currentTexts.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}