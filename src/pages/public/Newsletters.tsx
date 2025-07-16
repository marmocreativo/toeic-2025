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
import { Button } from '../../components/ui/button';

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
      ctaTitle: '¿Buscas Más Recursos?',
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {currentTexts.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {currentTexts.subtitle}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={currentTexts.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.updated}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.official}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Download className="w-8 h-8 text-purple-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.free}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletters Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              {filteredNewsletters.length} {filteredNewsletters.length === 1 ? 'boletín encontrado' : 'boletines encontrados'}
            </p>
          </div>

          {/* Grid de Newsletters */}
          {filteredNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNewsletters.map((newsletter) => (
                <div 
                  key={newsletter.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {/* Header con icono PDF */}
                  <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center relative">
                    <FileText className="w-20 h-20 text-white" />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm font-medium text-red-600">PDF</span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {newsletter.titulo}
                    </h3>
                    
                    {newsletter.descripcion && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {newsletter.descripcion}
                      </p>
                    )}

                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700" 
                          asChild
                        >
                          <a 
                            href={newsletter.archivo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {currentTexts.download}
                          </a>
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <Link to={generateLocalizedPath('newsletter_detalle', language, { id: newsletter.id.toString() })}>
                          {currentTexts.viewDetails}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentTexts.noResults}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentTexts.noResultsDesc}
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Limpiar Búsqueda
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {currentTexts.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {currentTexts.ctaDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link to={generateLocalizedPath('examenes', language)}>
                <BookOpen className="w-5 h-5 mr-2" />
                {currentTexts.ctaButton}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link to={generateLocalizedPath('centros', language)}>
                <Building2 className="w-5 h-5 mr-2" />
                {currentTexts.ctaSecondary}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}