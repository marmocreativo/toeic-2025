// src/pages/public/ExamenDetalle.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { examenService } from '../../services/examenService';
import type { ExamenCompleto, Examen } from '../../types/examen';
import { 
  Clock, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  BookOpen,
  HelpCircle,
  FileText,
  Building2,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Componente Hero Section
const ExamenHero = ({ examen }: { examen: ExamenCompleto }) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      backToExams: 'Volver a Exámenes'
    },
    en: {
      backToExams: 'Back to Tests'
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to={generateLocalizedPath('examenes', language)}
            className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            {currentTexts.backToExams}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
              {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>2-4 horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>Nivel: Todos</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Certificado oficial</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="lg:col-span-1">
            {examen.imagen ? (
              <img
                src={examen.imagen}
                alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-xl flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente Sidebar con Horarios
const HorariosSidebar = ({ horarios }: { horarios: any[] }) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Horarios Disponibles',
      noSchedules: 'No hay horarios disponibles',
      contact: 'Contacta para más información'
    },
    en: {
      title: 'Available Schedules',
      noSchedules: 'No schedules available',
      contact: 'Contact for more information'
    }
  };

  const currentTexts = texts[language];
  const horariosPublicados = horarios?.filter(h => h.publicado) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {currentTexts.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {horariosPublicados.length > 0 ? (
          <div className="space-y-3">
            {horariosPublicados.map((horario, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="font-medium text-gray-900 mb-1">
                  {horario.dia}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {horario.hora}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-3">{currentTexts.noSchedules}</p>
            <Button size="sm" variant="outline">
              {currentTexts.contact}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente Extras Sidebar
const ExtrasSidebar = ({ extras }: { extras: any[] }) => {
  const { language } = useLanguage();

  const extrasPublicados = extras?.filter(e => e.publicado) || [];

  if (extrasPublicados.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {extrasPublicados.map((extra, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {language === 'es' ? (extra.titulo || '') : (extra.en_titulo || '')}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {language === 'es' ? (extra.contenido || '') : (extra.en_contenido || '')}
            </p>
            {extra.boton_texto && extra.boton_enlace && (
              <Button size="sm" className="w-full" asChild>
                <a 
                  href={extra.boton_enlace} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  {language === 'es' ? (extra.boton_texto || '') : (extra.en_boton_texto || '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Componente Tab de Contenido
const ContenidoTab = ({ examen }: { examen: ExamenCompleto }) => {
  const { language } = useLanguage();

  const contenido = language === 'es' ? (examen.contenido || '') : (examen.en_contenido || '');

  return (
    <div className="prose prose-lg max-w-none">
      {contenido ? (
        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
          {contenido}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {language === 'es' ? 'Contenido no disponible' : 'Content not available'}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente Tab de Muestras
const MuestrasTab = ({ muestras }: { muestras: any[] }) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Preguntas de Práctica',
      noSamples: 'No hay muestras disponibles',
      section: 'Sección'
    },
    en: {
      title: 'Practice Questions',
      noSamples: 'No samples available',
      section: 'Section'
    }
  };

  const currentTexts = texts[language];
  const muestrasPublicadas = muestras?.filter(m => m.publicado) || [];

  return (
    <div>
      {muestrasPublicadas.length > 0 ? (
        <div className="space-y-6">
          {muestrasPublicadas.map((muestra, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {currentTexts.section}: {muestra.seccion}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {muestra.pregunta}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {currentTexts.noSamples}
          </h3>
          <p className="text-gray-500">
            {language === 'es' 
              ? 'Las preguntas de práctica estarán disponibles pronto' 
              : 'Practice questions will be available soon'}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente Tab de FAQs
const FaqTab = ({ faqs }: { faqs: any[] }) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Preguntas Frecuentes',
      noFaqs: 'No hay preguntas frecuentes disponibles'
    },
    en: {
      title: 'Frequently Asked Questions',
      noFaqs: 'No FAQs available'
    }
  };

  const currentTexts = texts[language];
  const faqsPublicadas = faqs?.filter(f => f.publicado) || [];

  return (
    <div>
      {faqsPublicadas.length > 0 ? (
        <div className="space-y-4">
          {faqsPublicadas.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  {language === 'es' ? (faq.pregunta || '') : (faq.en_pregunta || '')}
                </h3>
                <div className="text-gray-700 leading-relaxed pl-7">
                  {language === 'es' ? (faq.respuesta || '') : (faq.en_respuesta || '')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {currentTexts.noFaqs}
          </h3>
          <p className="text-gray-500">
            {language === 'es' 
              ? 'Las preguntas frecuentes estarán disponibles pronto' 
              : 'FAQs will be available soon'}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente de Otros Exámenes
const OtrosExamenes = ({ currentExamenId }: { currentExamenId: number }) => {
  const [otrosExamenes, setOtrosExamenes] = useState<Examen[]>([]);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Otros Exámenes TOEIC',
      viewDetails: 'Ver Detalles'
    },
    en: {
      title: 'Other TOEIC Tests',
      viewDetails: 'View Details'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadOtrosExamenes = async () => {
      try {
        const data = await examenService.getExamenes();
        const otrosExamenesFiltrados = data
          .filter(e => e.publicado && e.id !== currentExamenId)
          .slice(0, 2);
        setOtrosExamenes(otrosExamenesFiltrados);
      } catch (error) {
        console.error('Error loading otros examenes:', error);
      }
    };
    loadOtrosExamenes();
  }, [currentExamenId]);

  if (otrosExamenes.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {currentTexts.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otrosExamenes.map((examen) => (
            <Card key={examen.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {examen.imagen && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={examen.imagen}
                    alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                </p>
                <Button className="w-full" asChild>
                  <Link to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}>
                    {currentTexts.viewDetails}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente Call to Action
const CallToAction = () => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: '¿Listo para Agendar tu Examen?',
      description: 'Encuentra el centro más cercano y programa tu examen TOEIC hoy mismo.',
      primaryButton: 'Encontrar Centros',
      secondaryButton: 'Ver Horarios'
    },
    en: {
      title: 'Ready to Schedule Your Exam?',
      description: 'Find the nearest center and schedule your TOEIC exam today.',
      primaryButton: 'Find Centers',
      secondaryButton: 'View Schedules'
    }
  };

  const currentTexts = texts[language];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {currentTexts.title}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {currentTexts.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link to={generateLocalizedPath('centros', language)}>
              <Building2 className="w-5 h-5 mr-2" />
              {currentTexts.primaryButton}
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-blue-600"
            asChild
          >
            <Link to={generateLocalizedPath('examenes', language)}>
              <Calendar className="w-5 h-5 mr-2" />
              {currentTexts.secondaryButton}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// Componente Principal
export default function ExamenDetalle() {
  const { url } = useParams<{ url: string }>();
  const [examen, setExamen] = useState<ExamenCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const texts = {
    es: {
      content: 'Contenido',
      samples: 'Muestras',
      faqs: 'FAQs',
      notFound: 'Examen no encontrado',
      notFoundDesc: 'El examen que buscas no existe o no está disponible.',
      backToExams: 'Volver a Exámenes'
    },
    en: {
      content: 'Content',
      samples: 'Samples',
      faqs: 'FAQs',
      notFound: 'Test not found',
      notFoundDesc: 'The test you are looking for does not exist or is not available.',
      backToExams: 'Back to Tests'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadExamen = async () => {
      if (!url) return;
      
      try {
        setLoading(true);
        
        // Primero obtener todos los exámenes para encontrar el que coincida con la URL
        const examenes = await examenService.getExamenes();
        const examenEncontrado = examenes.find(e => e.url === url && e.publicado);
        
        if (!examenEncontrado) {
          setError('Examen no encontrado');
          return;
        }

        // Luego obtener los datos completos del examen
        const examenCompleto = await examenService.getExamenCompleto(examenEncontrado.id);
        
        if (!examenCompleto) {
          setError('Error cargando datos del examen');
          return;
        }

        setExamen(examenCompleto);
      } catch (err) {
        console.error('Error loading examen:', err);
        setError('Error cargando examen');
      } finally {
        setLoading(false);
      }
    };

    loadExamen();
  }, [url]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (error || !examen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentTexts.notFound}
          </h1>
          <p className="text-gray-600 mb-6">
            {currentTexts.notFoundDesc}
          </p>
          <Button asChild>
            <Link to={generateLocalizedPath('examenes', language)}>
              {currentTexts.backToExams}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <ExamenHero examen={examen} />

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Column */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="content" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {currentTexts.content}
                  </TabsTrigger>
                  <TabsTrigger value="samples" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {currentTexts.samples} ({(examen.muestras || []).filter(m => m.publicado).length})
                  </TabsTrigger>
                  <TabsTrigger value="faqs" className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    {currentTexts.faqs} ({(examen.faqs || []).filter(f => f.publicado).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <ContenidoTab examen={examen} />
                </TabsContent>

                <TabsContent value="samples">
                  <MuestrasTab muestras={examen.muestras || []} />
                </TabsContent>

                <TabsContent value="faqs">
                  <FaqTab faqs={examen.faqs || []} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <HorariosSidebar horarios={examen.horarios || []} />
              <ExtrasSidebar extras={examen.extras || []} />
            </div>
          </div>
        </div>
      </section>

      {/* Otros Exámenes */}
      <OtrosExamenes currentExamenId={examen.id} />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
}