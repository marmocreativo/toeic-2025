// src/pages/public/ExamenDetalle.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { examenService } from '../../services/examenService';
import type { ExamenCompleto } from '../../types/examen';
import FechasEspecialesCalendar from '../../components/public/FechasEspecialesCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RegistroWizard from "@/components/public/RegistroWizard";

// Importar los componentes separados
import ExamenHero from '../../components/public/ExamenHero';
import HorariosGrid from '../../components/public/HorariosGrid';
import ExtrasSidebar from '../../components/public/ExtrasSidebar';
import ContenidoTab from '../../components/public/ContenidoTab';
import MuestrasTab from '../../components/public/MuestrasTab';
import FaqTab from '../../components/public/FaqTab';
import OtrosExamenes from '../../components/public/OtrosExamenes';
import CallToAction from '../../components/public/CallToAction';

import {
  RefreshCw,
  BookOpen,
  FileText,
  HelpCircle
} from 'lucide-react';

// Componente Principal
export default function ExamenDetalle() {
  const { url } = useParams<{ url: string }>();
  const [examen, setExamen] = useState<ExamenCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [openRegistro, setOpenRegistro] = useState(false);
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
              <HorariosGrid 
                horarios={examen.horarios || []} 
                onRegisterClick={() => setOpenRegistro(true)} 
              />
              <FechasEspecialesCalendar 
                titulo={examen.texto_fechas_especiales || ''}
                fechasEspeciales={examen.fechas_especiales || []}
              />
              <ExtrasSidebar extras={examen.extras || []} />
            </div>
          </div>
        </div>
      </section>

      {/* Otros Exámenes */}
      <OtrosExamenes currentExamenId={examen.id} />

      {/* Call to Action */}
      <CallToAction />

      {/* Dialog de Registro */}
      <Dialog open={openRegistro} onOpenChange={setOpenRegistro}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Registro</DialogTitle>
          </DialogHeader>

          <RegistroWizard
            onClose={() => setOpenRegistro(false)}
            onFinish={() => setOpenRegistro(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}