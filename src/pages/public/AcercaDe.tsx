// src/pages/public/AcercaDe.tsx
import { useLanguage } from '../../hooks/useLanguage';
import {
  Target,
  Eye,
  Shield,
  Award,
  Heart,
  Lightbulb,
  Users,
  Building2,
  GraduationCap,
  MapPin,
  Laptop,
  BookOpen,
} from 'lucide-react';
import CallToAction from '../../components/public/CallToAction';

const valoresIcons = [Shield, Award, Heart, Lightbulb, Users];
const modalidadesIcons = [MapPin, Building2, Laptop];

export default function AcercaDe() {
  const { language } = useLanguage();

  const texts = {
    es: {
      hero: {
        tag: 'Quiénes somos',
        title: 'Evaluación del inglés con estándares de excelencia',
        subtitle:
          'En Review Quality nos especializamos en la evaluación objetiva y confiable del nivel de inglés, ofreciendo soluciones tanto para el sector académico como corporativo.',
      },
      mision: {
        label: 'Misión',
        text: 'Brindar servicios de evaluación del idioma inglés con altos estándares de calidad, objetividad y confiabilidad, que permitan a empresas e instituciones educativas tomar decisiones informadas, fortalecer sus procesos y desarrollar el potencial de las personas en un entorno global.',
      },
      vision: {
        label: 'Visión',
        text: 'Ser una empresa líder en evaluación del idioma inglés en el ámbito académico y corporativo, reconocida por la precisión de nuestros resultados, la innovación en nuestros procesos y nuestra contribución al desarrollo del talento con proyección internacional.',
      },
      valores: {
        title: 'Nuestros valores',
        items: [
          { label: 'Objetividad', description: 'Evaluamos con criterios claros, imparciales y basados en estándares reconocidos.' },
          { label: 'Calidad', description: 'Procesos rigurosos que permiten resultados confiables y consistentes.' },
          { label: 'Compromiso', description: 'Nos enfocamos en aportar valor real a cada cliente, entendiendo sus necesidades y objetivos.' },
          { label: 'Innovación', description: 'Buscamos mejorar continuamente nuestras metodologías y herramientas de evaluación.' },
          { label: 'Enfoque en el cliente', description: 'Ofrecemos soluciones flexibles y adaptadas tanto al sector corporativo como académico.' },
        ],
      },
      soluciones: {
        title: 'Nuestras soluciones',
        corporativo: {
          label: 'Sector corporativo',
          text: 'Apoyamos a las organizaciones en la evaluación del nivel de inglés de sus colaboradores y candidatos, permitiéndoles asegurar que cuentan con las competencias lingüísticas necesarias para desempeñarse eficazmente en entornos globales. Nuestros exámenes brindan resultados claros y confiables que respaldan procesos de reclutamiento, promoción y capacitación.',
        },
        academico: {
          label: 'Sector académico',
          text: 'Colaboramos con universidades e instituciones educativas en la evaluación del nivel de inglés de sus alumnos, proporcionando información estratégica que les permite monitorear, evaluar y fortalecer sus programas de estudio. Las instituciones pueden medir de forma objetiva el impacto de su formación y preparar mejor a sus egresados.',
        },
      },
      servicios: {
        title: 'Nuestros servicios',
        subtitle: 'Aplicación de certificaciones y evaluaciones de inglés',
        description: 'Ofrecemos opciones flexibles para que cada candidato o institución elija la modalidad que mejor se adapte a sus necesidades:',
        modalidades: [
          { label: 'En nuestras instalaciones', description: 'Entorno controlado, equipos configurados y supervisión profesional.' },
          { label: 'En tu empresa o institución', description: 'Enviamos un aplicador calificado para optimizar tiempos y logística.' },
          { label: 'De forma remota', description: 'Evaluaciones desde casa o desde un espacio autorizado, con supervisión digital.' },
        ],
        cursos: {
          label: 'Cursos de preparación',
          description: 'Programas diseñados para mejorar el desempeño en las evaluaciones, con prácticas, simuladores y retroalimentación personalizada.',
        },
      },
    },
    en: {
      hero: {
        tag: 'Who we are',
        title: 'English assessment with excellence standards',
        subtitle:
          'At Review Quality we specialize in the objective and reliable assessment of English proficiency, offering solutions for both the academic and corporate sectors.',
      },
      mision: {
        label: 'Mission',
        text: 'To provide English language assessment services with high standards of quality, objectivity and reliability, enabling companies and educational institutions to make informed decisions, strengthen their processes and develop the potential of people in a global environment.',
      },
      vision: {
        label: 'Vision',
        text: 'To be a leading company in English language assessment in the academic and corporate field, recognized for the precision of our results, the innovation in our processes and our contribution to talent development with international projection.',
      },
      valores: {
        title: 'Our values',
        items: [
          { label: 'Objectivity', description: 'We assess with clear, impartial criteria based on recognized standards.' },
          { label: 'Quality', description: 'Rigorous processes that deliver reliable and consistent results.' },
          { label: 'Commitment', description: 'We focus on providing real value to each client, understanding their needs and goals.' },
          { label: 'Innovation', description: 'We continuously seek to improve our assessment methodologies and tools.' },
          { label: 'Customer focus', description: 'We offer flexible solutions adapted to both the corporate and academic sectors.' },
        ],
      },
      soluciones: {
        title: 'Our solutions',
        corporativo: {
          label: 'Corporate sector',
          text: 'We support organizations in assessing the English proficiency of their employees and candidates, enabling them to ensure they have the linguistic competencies needed to perform effectively in global environments. Our exams provide clear and reliable results that support recruitment, promotion and training processes.',
        },
        academico: {
          label: 'Academic sector',
          text: 'We collaborate with universities and educational institutions in assessing the English level of their students, providing strategic information that enables them to monitor, evaluate and strengthen their study programs. Institutions can objectively measure the impact of their academic training and better prepare their graduates.',
        },
      },
      servicios: {
        title: 'Our services',
        subtitle: 'Application of English certifications and assessments',
        description: 'We offer flexible options so each candidate or institution can choose the modality that best suits their needs:',
        modalidades: [
          { label: 'At our facilities', description: 'Controlled environment, configured equipment and professional supervision.' },
          { label: 'At your company or institution', description: 'We send a qualified applicator to optimize time and logistics.' },
          { label: 'Remotely', description: 'Assessments from home or from an authorized space, with digital supervision.' },
        ],
        cursos: {
          label: 'Preparation courses',
          description: 'Programs designed to improve exam performance, with practice tests, simulators and personalized feedback.',
        },
      },
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="gradient-hero text-primary py-16 -mt-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <span className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-4">
                {t.hero.tag}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-6 leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-primary/80 leading-relaxed">
                {t.hero.subtitle}
              </p>
            </div>
            {/* Logo + imagen hero */}
            <div className="flex flex-col items-center gap-6">
              <img
                src="/images/logo.png"
                alt="Review Quality"
                className="h-16 w-auto"
              />
              <img
                src="/images/about.jpg"
                alt="Review Quality"
                className="rounded-xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Misión */}
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{t.mision.label}</h2>
              </div>
              <img
                src="/images/mision.jpg"
                alt="Misión"
                className="rounded-lg w-full object-cover"
              />
              <p className="text-gray-700 leading-relaxed">{t.mision.text}</p>
            </div>

            {/* Visión */}
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{t.vision.label}</h2>
              </div>
              <img
                src="/images/vision.jpg"
                alt="Visión"
                className="rounded-lg w-full object-cover"
              />
              <p className="text-gray-700 leading-relaxed">{t.vision.text}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-medium text-primary text-center mb-12">
            {t.valores.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {t.valores.items.map((valor, index) => {
              const Icon = valoresIcons[index];
              return (
                <div
                  key={index}
                  className="relative rounded-xl p-6 flex flex-col justify-between min-h-[160px] overflow-hidden w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, var(--color-accent)) 100%)' }}
                >
                  {/* Texto lado izquierdo */}
                  <div className="flex flex-col gap-2 z-10 relative">
                    <h3 className="text-lg font-semibold text-white">{valor.label}</h3>
                    <div className="w-8 h-0.5 bg-accent rounded-full" />
                    <p className="text-white/75 text-sm leading-relaxed mt-1">{valor.description}</p>
                  </div>

                  {/* Icono esquina inferior derecha, grande y semitransparente */}
                  <div className="absolute bottom-3 right-4 opacity-20">
                    <Icon className="w-20 h-20 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Soluciones */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-medium text-primary text-center mb-12">
            {t.soluciones.title}
          </h2>

          {/* Corporativo */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{t.soluciones.corporativo.label}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{t.soluciones.corporativo.text}</p>
              </div>
              <img
                src="/images/corporate.jpg"
                alt="Sector corporativo"
                className="rounded-xl w-full object-cover shadow-sm"
              />
            </div>
          </div>

          {/* Académico */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <img
                src="/images/education.jpg"
                alt="Sector académico"
                className="rounded-xl w-full object-cover shadow-sm order-2 md:order-1"
              />
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{t.soluciones.academico.label}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{t.soluciones.academico.text}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-medium text-primary text-center mb-4">
            {t.servicios.title}
          </h2>
          <h3 className="text-xl font-semibold text-gray-700 text-center mb-3">
            {t.servicios.subtitle}
          </h3>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            {t.servicios.description}
          </p>

          {/* Modalidades */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {t.servicios.modalidades.map((mod, index) => {
              const Icon = modalidadesIcons[index];
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="bg-primary/10 rounded-lg p-2 w-fit">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{mod.label}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{mod.description}</p>
                </div>
              );
            })}
          </div>

          {/* Cursos de preparación */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-white" />
                  <h4 className="text-xl font-semibold text-white">{t.servicios.cursos.label}</h4>
                </div>
                <p className="text-white/80 leading-relaxed">{t.servicios.cursos.description}</p>
              </div>
              <img
                src="/images/courses.jpg"
                alt="Cursos de preparación"
                className="rounded-xl w-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      <CallToAction />
    </div>
  );
}