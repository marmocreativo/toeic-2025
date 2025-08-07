// src/pages/public/Examenes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { examenService } from '../../services/examenService';
import type { Examen } from '../../types/examen';
import { 
  Clock,
  Award, 
  ArrowRight, 
  Search,
  Filter,
  Building2,
  BookOpen,
  Target
} from 'lucide-react';

export default function Examenes() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [filteredExamenes, setFilteredExamenes] = useState<Examen[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'Exámenes TOEIC',
      subtitle: 'Encuentra el examen TOEIC perfecto para tus necesidades profesionales',
      searchPlaceholder: 'Buscar exámenes...',
      noResults: 'No se encontraron exámenes',
      noResultsDesc: 'Intenta con otros términos de búsqueda',
      learnMore: 'Conoce Más',
      viewDetails: 'Ver Detalles',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Programa tu examen en uno de nuestros centros autorizados y da el siguiente paso en tu carrera profesional.',
      ctaButton: 'Encontrar Centros',
      ctaSecondary: 'Ver Horarios',
      clearFilters: 'Limpiar Filtros',
      resultsCount: 'exámenes encontrados',
      resultsSingle: 'examen encontrado',
      features: {
        global: 'Reconocimiento Global',
        fast: 'Resultados Rápidos',
        reliable: 'Evaluación Confiable'
      }
    },
    en: {
      title: 'TOEIC Tests',
      subtitle: 'Find the perfect TOEIC test for your professional needs',
      searchPlaceholder: 'Search tests...',
      noResults: 'No tests found',
      noResultsDesc: 'Try different search terms',
      learnMore: 'Learn More',
      viewDetails: 'View Details',
      ctaTitle: 'Ready to Start Your TOEIC Assessment?',
      ctaDescription: 'Schedule your test at one of our authorized centers and take the next step in your professional career.',
      ctaButton: 'Find Centers',
      ctaSecondary: 'View Schedules',
      clearFilters: 'Clear Filters',
      resultsCount: 'tests found',
      resultsSingle: 'test found',
      features: {
        global: 'Global Recognition',
        fast: 'Fast Results',
        reliable: 'Reliable Assessment'
      }
    }
  };

  const currentTexts = texts[language];

  // Cargar exámenes
  useEffect(() => {
    const loadExamenes = async () => {
      try {
        setLoading(true);
        const data = await examenService.getExamenes();
        const publicExamenes = data.filter(examen => examen.publicado);
        setExamenes(publicExamenes);
        setFilteredExamenes(publicExamenes);
      } catch (error) {
        console.error('Error loading examenes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExamenes();
  }, []);

  // Filtrar exámenes por término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredExamenes(examenes);
    } else {
      const filtered = examenes.filter(examen => {
        const titulo = language === 'es' ? examen.titulo : examen.en_titulo;
        const resumen = language === 'es' ? examen.resumen : examen.en_resumen;
        const contenido = language === 'es' ? examen.contenido : examen.en_contenido;
        
        const searchText = searchTerm.toLowerCase();
        return (
          (titulo && titulo.toLowerCase().includes(searchText)) ||
          (resumen && resumen.toLowerCase().includes(searchText)) ||
          (contenido && contenido.toLowerCase().includes(searchText))
        );
      });
      setFilteredExamenes(filtered);
    }
  }, [searchTerm, examenes, language]);

  // Componente de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-border rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <section className="gradient-hero text-white py-16 -mt-16 pt-24">
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
      <section className="hidden md:block bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x-1 divide-solid divide-white">
            <div className="flex items-center justify-center space-x-3">
              <Award className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.global}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.fast}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Target className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.reliable}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Exámenes Grid */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-secondary">
              {filteredExamenes.length} {filteredExamenes.length === 1 ? currentTexts.resultsSingle : currentTexts.resultsCount}
            </p>
          </div>

          {/* Grid de Exámenes */}
          {filteredExamenes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredExamenes.map((examen) => (
                <Link
                  key={examen.id}
                  to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                  className="exam-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer block"
                >
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Columna Izquierda - Imagen */}
                    <div className="col-span-5">
                      {examen.imagen ? (
                        <img
                          src={examen.imagen}
                          alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg rounded-lg flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    {/* Columna Derecha - Contenido */}
                    <div className="col-span-7 flex flex-col justify-center p-4">
                      <h3 className="text-lg font-semibold text-text mb-3 leading-tight">
                        {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                      </h3>
                      
                      <p className="text-text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                        {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                      </p>

                      <div className="inline-flex items-center text-primary font-medium group">
                        <span>{currentTexts.viewDetails}</span>
                        <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-border mx-auto mb-4" />
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
                <Filter className="w-4 h-4 mr-2" />
                {currentTexts.clearFilters}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {currentTexts.ctaTitle}
              </h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                {currentTexts.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={generateLocalizedPath('centros', language)}
                  className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  {currentTexts.ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}