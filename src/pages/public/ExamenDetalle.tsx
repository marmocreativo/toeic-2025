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
  RefreshCw
} from 'lucide-react';

// Componente Hero Section
const ExamenHero = ({ examen }: { examen: ExamenCompleto }) => {
  const { language } = useLanguage();

  return (
    <section className="gradient-hero text-white py-4 -mt-16 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-primary font-medium mb-4">
              {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
            </h1>
            <p className="text-xl md:text-2xl text-primary/90 mb-6 leading-relaxed">
              {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
            </p>
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
              <div className="w-full h-64 lg:h-80 gradient-accent rounded-lg shadow-xl flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-black" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


// Componente HorariosGrid mejorado para reemplazar HorariosSidebar

// Componente HorariosGrid mejorado para reemplazar HorariosSidebar
const HorariosGrid = ({ horarios }: { horarios: any[] }) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Horarios Disponibles',
      noSchedules: 'No hay horarios disponibles',
      contact: 'Contacta para más información',
      available: 'Disponible',
      notAvailable: 'No disponible',
      registerNow: 'Registrarte Ahora'
    },
    en: {
      title: 'Available Schedules',
      noSchedules: 'No schedules available',
      contact: 'Contact for more information',
      available: 'Available',
      notAvailable: 'Not available',
      registerNow: 'Register Now'
    }
  };

  const currentTexts = texts[language];
  const horariosPublicados = horarios?.filter(h => h.publicado) || [];

  // Días de la semana en orden (solo una letra)
  const diasSemana = [
    { key: 'lunes', label: 'L', fullName: language === 'es' ? 'Lunes' : 'Monday' },
    { key: 'martes', label: 'M', fullName: language === 'es' ? 'Martes' : 'Tuesday' },
    { key: 'miércoles', label: 'X', fullName: language === 'es' ? 'Miércoles' : 'Wednesday' },
    { key: 'jueves', label: 'J', fullName: language === 'es' ? 'Jueves' : 'Thursday' },
    { key: 'viernes', label: 'V', fullName: language === 'es' ? 'Viernes' : 'Friday' },
    { key: 'sábado', label: 'S', fullName: language === 'es' ? 'Sábado' : 'Saturday' },
    { key: 'domingo', label: 'D', fullName: language === 'es' ? 'Domingo' : 'Sunday' }
  ];

  // Horarios estándar
  const horasStandard = [
    '9:30',
    '10:00',
    '12:00',
    '12:30',
    '14:00', 
    '15:30',
    '16:00'
  ];

  // Crear matriz de disponibilidad
  const crearMatrizHorarios = () => {
    const matriz: { [key: string]: { [key: string]: boolean } } = {};
    
    // Inicializar todas las combinaciones como no disponibles
    diasSemana.forEach(dia => {
      matriz[dia.key] = {};
      horasStandard.forEach(hora => {
        matriz[dia.key][hora] = false;
      });
    });

    // Marcar horarios disponibles
    horariosPublicados.forEach(horario => {
      const diaKey = horario.dia?.toLowerCase();
      const hora = horario.hora;
      
      // Buscar día coincidente
      const diaEncontrado = diasSemana.find(d => 
        diaKey?.includes(d.key) || 
        diaKey?.includes(d.fullName.toLowerCase()) ||
        horario.dia?.toLowerCase().includes(d.fullName.toLowerCase())
      );
      
      if (diaEncontrado && horasStandard.includes(hora)) {
        matriz[diaEncontrado.key][hora] = true;
      }
    });

    return matriz;
  };

  // Obtener horarios especiales (no estándar)
  const obtenerHorariosEspeciales = () => {
    return horariosPublicados.filter(horario => {
      const diaKey = horario.dia?.toLowerCase();
      const hora = horario.hora;
      
      // Si no es un día estándar o no es una hora estándar
      const esDiaStandard = diasSemana.some(d => 
        diaKey?.includes(d.key) || 
        diaKey?.includes(d.fullName.toLowerCase())
      );
      const esHoraStandard = horasStandard.includes(hora);
      
      return !esDiaStandard || !esHoraStandard;
    });
  };

  // Filtrar días que tienen al menos un horario disponible
  const obtenerDiasConHorarios = () => {
    const matrizHorarios = crearMatrizHorarios();
    
    return diasSemana.filter(dia => {
      // Verificar si el día tiene al menos un horario disponible
      return Object.values(matrizHorarios[dia.key]).some(disponible => disponible);
    });
  };

  const matrizHorarios = crearMatrizHorarios();
  const horariosEspeciales = obtenerHorariosEspeciales();
  const diasConHorarios = obtenerDiasConHorarios();

  // Verificar si hay algún horario disponible
  const hayHorariosDisponibles = diasConHorarios.length > 0 || horariosEspeciales.length > 0;

  if (!hayHorariosDisponibles) {
    return (
      <div className="bg-bg-light rounded-lg shadow-md border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {currentTexts.title}
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-border mx-auto mb-3" />
            <p className="text-text-muted text-sm mb-4">{currentTexts.noSchedules}</p>
            <button className="btn-outline-primary text-sm px-4 py-2">
              {currentTexts.contact}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-light rounded-lg shadow-md border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {currentTexts.title}
        </h3>
      </div>
      
      <div className="p-4">
        {/* Cuadrícula de horarios estándar - Solo días con horarios */}
        {diasConHorarios.length > 0 && (
          <div className="mb-4">
            {/* Header con las horas */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `40px repeat(${horasStandard.length}, 1fr)` }}>
              <div></div> {/* Espacio vacío para alinear */}
              {horasStandard.map(hora => (
                <div key={hora} className="text-center text-xs font-medium text-text-muted py-2">
                  {hora}
                </div>
              ))}
            </div>

            {/* Filas de días - Solo días que tienen horarios */}
            {diasConHorarios.map(dia => (
              <div key={dia.key} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px repeat(${horasStandard.length}, 1fr)` }}>
                {/* Label del día - Solo una letra */}
                <div 
                  className="flex items-center justify-center bg-bg border border-border rounded text-xs font-bold text-text h-10 w-10"
                  title={dia.fullName}
                >
                  {dia.label}
                </div>
                
                {/* Celdas de horas */}
                {horasStandard.map(hora => {
                  const disponible = matrizHorarios[dia.key][hora];
                  return (
                    <div
                      key={`${dia.key}-${hora}`}
                      className={`
                        flex items-center justify-center h-10 rounded text-xs font-medium transition-all cursor-pointer
                        ${disponible 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-200 cursor-default'
                        }
                      `}
                      title={`${dia.fullName} ${hora} - ${disponible ? currentTexts.available : currentTexts.notAvailable}`}
                    >
                      {/* Sin iconos, solo color de fondo */}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Leyenda compacta */}
        <div className="flex items-center justify-center gap-4 text-xs mb-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-text-muted">{currentTexts.available}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-text-muted">{currentTexts.notAvailable}</span>
          </div>
        </div>

        {/* Horarios especiales */}
        {horariosEspeciales.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-medium text-text mb-3">Horarios Especiales:</h4>
            <div className="space-y-2">
              {horariosEspeciales.map((horario, index) => (
                <div key={index} className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text text-sm">{horario.dia}</div>
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {horario.hora}
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="mt-6">
          <Link
            to={generateLocalizedPath('centros', language)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4" />
            {currentTexts.registerNow}
          </Link>
        </div>
      </div>
    </div>
  );
};
// Componente Extras Sidebar - ACTUALIZADO con mejores estilos
const ExtrasSidebar = ({ extras }: { extras: any[] }) => {
  const { language } = useLanguage();

  const extrasPublicados = extras?.filter(e => e.publicado) || [];

  if (extrasPublicados.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {extrasPublicados.map((extra, index) => (
        <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border p-4">
          <h3 className="font-semibold text-text mb-2">
            {language === 'es' ? (extra.titulo || '') : (extra.en_titulo || '')}
          </h3>
          <div 
            className="wysiwyg-content extra-content text-sm text-text-muted mb-3"
            dangerouslySetInnerHTML={{ 
              __html: language === 'es' ? (extra.contenido || '') : (extra.en_contenido || '') 
            }}
          />
          {extra.boton_texto && extra.boton_enlace && (
            <a 
              href={extra.boton_enlace} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              {language === 'es' ? (extra.boton_texto || '') : (extra.en_boton_texto || '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente Tab de Contenido - ACTUALIZADO con mejores estilos
const ContenidoTab = ({ examen }: { examen: ExamenCompleto }) => {
  const { language } = useLanguage();

  const contenido = language === 'es' ? (examen.contenido || '') : (examen.en_contenido || '');

  return (
    <div className="prose prose-lg max-w-none">
      {contenido ? (
        <div 
          className="wysiwyg-content"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-border mx-auto mb-4" />
          <p className="text-text-muted">
            {language === 'es' ? 'Contenido no disponible' : 'Content not available'}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente Tab de Muestras - ACTUALIZADO
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
            <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {currentTexts.section}: {muestra.seccion}
                </h3>
              </div>
              <div className="p-4">
                {/* Usar wysiwyg-content también para las muestras */}
                <div 
                  className="wysiwyg-content"
                  dangerouslySetInnerHTML={{ __html: muestra.pregunta || '' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            {currentTexts.noSamples}
          </h3>
          <p className="text-text-muted">
            {language === 'es' 
              ? 'Las preguntas de práctica estarán disponibles pronto' 
              : 'Practice questions will be available soon'}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente Tab de FAQs - ACTUALIZADO con mejores estilos
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
            <div key={index} className="bg-bg-light rounded-lg shadow-md border border-border p-6">
              <h3 className="font-semibold text-text mb-3 flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                {language === 'es' ? (faq.pregunta || '') : (faq.en_pregunta || '')}
              </h3>
              <div 
                className="wysiwyg-content faq-content text-text-muted leading-relaxed pl-7"
                dangerouslySetInnerHTML={{ 
                  __html: language === 'es' ? (faq.respuesta || '') : (faq.en_respuesta || '') 
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            {currentTexts.noFaqs}
          </h3>
          <p className="text-text-muted">
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
    <section className="py-16 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-medium text-center text-primary mb-12">
          {currentTexts.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otrosExamenes.map((examen) => (
            <div key={examen.id} className="bg-bg-light rounded-lg shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
              {examen.imagen && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={examen.imagen}
                    alt={language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-text mb-3">
                  {language === 'es' ? (examen.titulo || '') : (examen.en_titulo || '')}
                </h3>
                <p className="text-text-muted mb-4 line-clamp-3">
                  {language === 'es' ? (examen.resumen || '') : (examen.en_resumen || '')}
                </p>
                <Link 
                  to={generateLocalizedPath('examen_detalle', language, { url: examen.url })}
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                >
                  {currentTexts.viewDetails}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
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
      title: '¡No lo pienses más!',
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
    <section className="py-16 gradient-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-x-1 divide-solid divide-white">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentTexts.title}
            </h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              {currentTexts.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={generateLocalizedPath('centros', language)}
                className="inline-flex items-center px-8 py-3 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition-colors"
              >
                <Building2 className="w-5 h-5 mr-2" />
                {currentTexts.primaryButton}
              </Link>
            </div>
          </div>
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
  const [activeTab, setActiveTab] = useState('content');
  const { language } = useLanguage();

  const texts = {
    es: {
      content: 'Contenido',
      samples: 'Muestras',
      faqs: 'FAQs',
      notFound: 'Examen no encontrado',
      notFoundDesc: 'El examen que buscas no existe o no está disponible.',
      backToExams: 'Volver a Exámenes',
      loading: 'Cargando examen...'
    },
    en: {
      content: 'Content',
      samples: 'Samples',
      faqs: 'FAQs',
      notFound: 'Test not found',
      notFoundDesc: 'The test you are looking for does not exist or is not available.',
      backToExams: 'Back to Tests',
      loading: 'Loading test...'
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const loadExamen = async () => {
      if (!url) return;
      
      try {
        setLoading(true);
        
        const examenes = await examenService.getExamenes();
        const examenEncontrado = examenes.find(e => e.url === url && e.publicado);
        
        if (!examenEncontrado) {
          setError('Examen no encontrado');
          return;
        }

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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-muted">{currentTexts.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !examen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-border mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-text mb-2">
            {currentTexts.notFound}
          </h1>
          <p className="text-text-muted mb-6">
            {currentTexts.notFoundDesc}
          </p>
          <Link to={generateLocalizedPath('examenes', language)} className="btn-primary">
            {currentTexts.backToExams}
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: currentTexts.content, icon: FileText },
    { 
      id: 'samples', 
      label: `${currentTexts.samples} (${(examen.muestras || []).filter(m => m.publicado).length})`, 
      icon: BookOpen 
    },
    { 
      id: 'faqs', 
      label: `${currentTexts.faqs} (${(examen.faqs || []).filter(f => f.publicado).length})`, 
      icon: HelpCircle 
    }
  ];

  return (
    <div className="bg-bg">
      {/* Hero Section */}
      <ExamenHero examen={examen} />

      {/* Main Content */}
      <section className="py-12 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Column */}
            <div className="lg:col-span-2">
              {/* Custom Tabs */}
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="border-b border-border">
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text hover:border-border'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-bg-light rounded-lg border border-border p-6">
                  {activeTab === 'content' && <ContenidoTab examen={examen} />}
                  {activeTab === 'samples' && <MuestrasTab muestras={examen.muestras || []} />}
                  {activeTab === 'faqs' && <FaqTab faqs={examen.faqs || []} />}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <HorariosGrid horarios={examen.horarios || []} />
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