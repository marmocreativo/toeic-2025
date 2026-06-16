// src/pages/public/PaginaDetalle.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate  } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { paginaService } from '../../services/paginaService';
import type { Pagina } from '../../types/pagina';
import  CallToAction from '../../components/public/CallToAction';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function PaginaDetalle() {
  const navigate = useNavigate();
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
      readingTime: 'min de lectura',
      contentNotAvailable: 'Contenido no disponible',
      loading: 'Cargando página...',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes o encuentra un centro autorizado.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros'
    },
    en: {
      backToPages: 'Back to Pages',
      notFound: 'Page not found',
      notFoundDesc: 'The page you are looking for does not exist or is not available.',
      lastUpdated: 'Last updated',
      readingTime: 'min read',
      contentNotAvailable: 'Content not available',
      loading: 'Loading page...',
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
    }, [url]);

    useEffect(() => {
    if (!pagina) return;

    const slugCorrecto = language === 'es' 
      ? pagina.url 
      : (pagina.en_url || pagina.url);

    if (slugCorrecto && slugCorrecto !== url) {
      const newPath = language === 'es'
        ? `/pagina/${slugCorrecto}`
        : `/en/page/${slugCorrecto}`;
      navigate(newPath, { replace: true });
    }
  }, [language, pagina]);

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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-muted">{currentTexts.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !pagina) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-md mx-auto px-4">
          <FileText className="w-16 h-16 text-border mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-text mb-2">
            {currentTexts.notFound}
          </h1>
          <p className="text-text-muted mb-6">
            {currentTexts.notFoundDesc}
          </p>
          <Link
            to={generateLocalizedPath('paginas', language)}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentTexts.backToPages}
          </Link>
        </div>
      </div>
    );
  }

  const titulo = language === 'es' ? (pagina.titulo || '') : (pagina.en_titulo || pagina.titulo || '');
  const contenido = language === 'es' ? (pagina.contenido || '') : (pagina.en_contenido || pagina.contenido || '');
  const resumen = language === 'es' ? (pagina.resumen || '') : (pagina.en_resumen || pagina.resumen || '');

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-bg-light border-b border-border -mt-16 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={generateLocalizedPath('paginas', language)}
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToPages}
            </Link>
          </div>

          {/* Título y metadatos */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-medium text-primary mb-4 leading-tight">
              {titulo}
            </h1>
            
            {resumen && (
              <p className="text-xl text-secondary mb-6 leading-relaxed">
                {resumen}
              </p>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentTexts.lastUpdated}: {formatDate(pagina.updated_at || pagina.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.ceil((contenido?.length || 0) / 1000)} {currentTexts.readingTime}
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
      <section className="py-16 bg-bg-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            {contenido ? (
              <div 
                className="prose prose-lg max-w-none text-text"
                dangerouslySetInnerHTML={{ __html: contenido }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-border mx-auto mb-4" />
                <p className="text-text-muted text-lg">
                  {currentTexts.contentNotAvailable}
                </p>
              </div>
            )}
          </article>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}