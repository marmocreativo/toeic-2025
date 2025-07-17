// src/pages/public/NewsletterDetalle.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { getNewsletter, getNewsletters } from '../../services/newsletterService';
import type { Newsletter } from '../../types/newsletter';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  RefreshCw,
  Download,
  Building2,
  BookOpen,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function NewsletterDetalle() {
  const { id } = useParams<{ id: string }>();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [otrosNewsletters, setOtrosNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const texts = {
    es: {
      backToNewsletters: 'Volver a Boletines',
      notFound: 'Boletín no encontrado',
      notFoundDesc: 'El boletín que buscas no existe o no está disponible.',
      publishedOn: 'Publicado el',
      downloadPdf: 'Descargar PDF',
      openPdf: 'Abrir PDF',
      fileSize: 'Tamaño del archivo',
      otherNewsletters: 'Otros Boletines',
      viewDetails: 'Ver Detalles',
      loading: 'Cargando boletín...',
      pdfAvailable: 'Documento PDF disponible para descarga',
      download: 'Descargar',
      open: 'Abrir',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes o encuentra un centro autorizado.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros'
    },
    en: {
      backToNewsletters: 'Back to Newsletters',
      notFound: 'Newsletter not found',
      notFoundDesc: 'The newsletter you are looking for does not exist or is not available.',
      publishedOn: 'Published on',
      downloadPdf: 'Download PDF',
      openPdf: 'Open PDF',
      fileSize: 'File size',
      otherNewsletters: 'Other Newsletters',
      viewDetails: 'View Details',
      loading: 'Loading newsletter...',
      pdfAvailable: 'PDF document available for download',
      download: 'Download',
      open: 'Open',
      ctaTitle: 'Need More Information?',
      ctaDescription: 'Explore our tests or find an authorized center.',
      ctaButton: 'View Tests',
      ctaSecondary: 'Find Centers'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadNewsletter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Cargar el newsletter específico
        const newsletterData = await getNewsletter(parseInt(id));
        
        if (!newsletterData || !newsletterData.publicado) {
          setError('Newsletter no encontrado');
          return;
        }

        setNewsletter(newsletterData);

        // Cargar otros newsletters para recomendaciones
        const todosNewsletters = await getNewsletters();
        const otrosNewslettersFiltrados = todosNewsletters
          .filter(n => n.publicado && n.id !== newsletterData.id)
          .slice(0, 3);
        
        setOtrosNewsletters(otrosNewslettersFiltrados);

      } catch (err) {
        console.error('Error loading newsletter:', err);
        setError('Error cargando boletín');
      } finally {
        setLoading(false);
      }
    };

    loadNewsletter();
  }, [id]);

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

  if (error || !newsletter) {
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
            to={generateLocalizedPath('newsletters', language)}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentTexts.backToNewsletters}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-bg-light border-b border-border -mt-16 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={generateLocalizedPath('newsletters', language)}
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToNewsletters}
            </Link>
          </div>

          {/* Título y metadatos */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-medium text-primary mb-4 leading-tight">
              {newsletter.titulo}
            </h1>
            
            {newsletter.descripcion && (
              <p className="text-xl text-secondary mb-6 leading-relaxed">
                {newsletter.descripcion}
              </p>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentTexts.publishedOn}: {formatDate(newsletter.fecha_publicacion)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
            </div>

            {/* Botones de acción */}
            {newsletter.archivo && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={newsletter.archivo} 
                  download
                  className="btn-accent px-8 py-4 inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {currentTexts.downloadPdf}
                </a>
                
                <a 
                  href={newsletter.archivo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-outline-primary px-8 py-4 inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  {currentTexts.openPdf}
                </a>
              </div>
            )}
          </div>

          {/* Preview del PDF */}
          <div className="bg-accent/10 rounded-lg p-8 text-center border border-accent/20">
            <FileText className="w-20 h-20 text-accent-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">
              {newsletter.titulo}
            </h3>
            <p className="text-text-muted mb-4">
              {currentTexts.pdfAvailable}
            </p>
            {newsletter.archivo && (
              <div className="flex justify-center gap-3">
                <a 
                  href={newsletter.archivo} 
                  download
                  className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent-dark text-black font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {currentTexts.download}
                </a>
                <a 
                  href={newsletter.archivo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {currentTexts.open}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Otros Newsletters */}
      {otrosNewsletters.length > 0 && (
        <section className="py-16 bg-bg-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-medium text-center text-primary mb-12">
              {currentTexts.otherNewsletters}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otrosNewsletters.map((otroNewsletter) => (
                <div key={otroNewsletter.id} className="bg-bg-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border">
                  {/* Header con icono PDF */}
                  <div className="h-32 gradient-accent flex items-center justify-center relative">
                    <FileText className="w-12 h-12 text-black opacity-80" />
                    <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full p-1">
                      <Download className="w-3 h-3 text-black" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2">
                      {otroNewsletter.titulo}
                    </h3>
                    
                    {otroNewsletter.descripcion && (
                      <p className="text-text-muted text-sm mb-3 line-clamp-2">
                        {otroNewsletter.descripcion}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-text-muted mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(otroNewsletter.fecha_publicacion)}</span>
                    </div>

                    <Link 
                      to={generateLocalizedPath('newsletter_detalle', language, { id: otroNewsletter.id.toString() })}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      {currentTexts.viewDetails}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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