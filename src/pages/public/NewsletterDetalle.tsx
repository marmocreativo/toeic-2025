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
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

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
      ctaTitle: '¿Necesitas Más Información?',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando boletín...</p>
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
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
            <Link to={generateLocalizedPath('newsletters', language)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToNewsletters}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={generateLocalizedPath('newsletters', language)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentTexts.backToNewsletters}
            </Link>
          </div>

          {/* Título y metadatos */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {newsletter.titulo}
            </h1>
            
            {newsletter.descripcion && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {newsletter.descripcion}
              </p>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
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
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700"
                  asChild
                >
                  <a 
                    href={newsletter.archivo} 
                    download
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {currentTexts.downloadPdf}
                  </a>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  asChild
                >
                  <a 
                    href={newsletter.archivo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {currentTexts.openPdf}
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Preview del PDF */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-8 text-center border border-red-200">
            <FileText className="w-20 h-20 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {newsletter.titulo}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'es' 
                ? 'Documento PDF disponible para descarga' 
                : 'PDF document available for download'}
            </p>
            {newsletter.archivo && (
              <div className="flex justify-center gap-3">
                <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
                  <a href={newsletter.archivo} download>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={newsletter.archivo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Otros Newsletters */}
      {otrosNewsletters.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {currentTexts.otherNewsletters}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otrosNewsletters.map((otroNewsletter) => (
                <Card key={otroNewsletter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header con icono PDF */}
                  <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center relative">
                    <FileText className="w-12 h-12 text-white" />
                    <div className="absolute top-2 right-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-1">
                      <Download className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {otroNewsletter.titulo}
                    </h3>
                    
                    {otroNewsletter.descripcion && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {otroNewsletter.descripcion}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(otroNewsletter.fecha_publicacion)}</span>
                    </div>

                    <Button className="w-full" size="sm" asChild>
                      <Link to={generateLocalizedPath('newsletter_detalle', language, { id: otroNewsletter.id.toString() })}>
                        {currentTexts.viewDetails}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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