// src/pages/public/PaginaDetalle.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { paginaService } from '../../services/paginaService';
import type { Pagina } from '../../types/pagina';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  RefreshCw,
  Clock,
  Building2,
  BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function PaginaDetalle() {
  const { url } = useParams<{ url: string }>();
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const texts = {
    es: {
      backToPages: 'Volver a Páginas',
      notFound: 'Página no encontrada',
      notFoundDesc: 'La página que buscas no existe o no está disponible.',
      lastUpdated: 'Última actualización',
      ctaTitle: '¿Necesitas Más Información?',
      ctaDescription: 'Explora nuestros exámenes o encuentra un centro autorizado.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros'
    },
    en: {
      backToPages: 'Back to Pages',
      notFound: 'Page not found',
      notFoundDesc: 'The page you are looking for does not exist or is not available.',
      lastUpdated: 'Last updated',
      ctaTitle: 'Need More Information?',
      ctaDescription: 'Explore our tests or find an authorized center.',
      ctaButton: 'View Tests',
      ctaSecondary: 'Find Centers'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadPagina = async () => {
      if (!url) return;
      
      try {
        setLoading(true);
        
        // Obtener todas las páginas para encontrar la que coincida con la URL
        const paginas = await paginaService.getPaginas();
        let paginaEncontrada;

        if (language === 'es') {
          // En español, buscar por URL principal
          paginaEncontrada = paginas.find(p => p.url === url && p.publicado);
        } else {
          // En inglés, buscar por en_url o URL principal como fallback
          paginaEncontrada = paginas.find(p => 
            ((p.en_url && p.en_url === url) || (!p.en_url && p.url === url)) && p.publicado
          );
        }
        
        if (!paginaEncontrada) {
          setError('Página no encontrada');
          return;
        }

        setPagina(paginaEncontrada);
      } catch (err) {
        console.error('Error loading pagina:', err);
        setError('Error cargando página');
      } finally {
        setLoading(false);
      }
    };

    loadPagina();
  }, [url, language]);

  // Formato de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  if (error || !pagina) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentTexts.notFound}
          </h1>
          <p className="text-gray-600 mb-6">
            {currentTexts.notFoundDesc}
          </p>
          <Button asChild>
            <Link to={generateLocalizedPath('paginas', language)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToPages}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const titulo = language === 'es' ? (pagina.titulo || '') : (pagina.en_titulo || pagina.titulo || '');
  const contenido = language === 'es' ? (pagina.contenido || '') : (pagina.en_contenido || pagina.contenido || '');
  const resumen = language === 'es' ? (pagina.resumen || '') : (pagina.en_resumen || pagina.resumen || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={generateLocalizedPath('paginas', language)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToPages}
            </Link>
          </div>

          {/* Título y metadatos */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {titulo}
            </h1>
            
            {resumen && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {resumen}
              </p>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentTexts.lastUpdated}: {formatDate(pagina.updated_at || pagina.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.ceil((contenido?.length || 0) / 1000)} min de lectura
                </span>
              </div>
            </div>
          </div>

          {/* Imagen destacada */}
          {pagina.imagen && (
            <div className="mb-8">
              <img
                src={pagina.imagen}
                alt={titulo}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg prose-blue max-w-none">
            {contenido ? (
              <div 
                className="whitespace-pre-wrap leading-relaxed text-gray-700"
                style={{
                  lineHeight: '1.8',
                  fontSize: '1.125rem'
                }}
              >
                {contenido.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') {
                    return <br key={index} />;
                  }
                  return (
                    <p key={index} className="mb-6">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {language === 'es' ? 'Contenido no disponible' : 'Content not available'}
                </p>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {currentTexts.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
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