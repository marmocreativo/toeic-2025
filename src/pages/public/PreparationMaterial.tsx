import { useLanguage } from '../../hooks/useLanguage';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import  CallToAction from '../../components/public/CallToAction';

export default function PreparationMaterial() {
    const { language } = useLanguage();

    const texts = {
        es: {
            title: 'Materiales de preparación para el exámen TOEIC®',
            subtitle: 'Prepárate para el éxito con manuales oficiales para examinandos, exámenes de muestra y otros materiales de preparación para el examen',
            officialCourse: {
                title: 'CURSO OFICIAL DE PREPARACIÓN TOEIC® EN LÍNEA',
                buttonText: 'IR A LA PRUEBA',
                description: 'La guía Oficial de preparación TOEIC® es un curso en línea diseñado para ayudar a las personas a desarrollar las habilidades necesarias para tener éxito en el examen TOEIC® Listening y Reading. Es el único curso en línea desarrollado por los creadores de la certificación TOEIC®, el cual contiene hasta 5 exámenes Listening y Reading completos.',
                features: [
                    'Con más contenido del examen TOEIC® que cualquier otro curso en línea',
                    'Introducción a los exámenes TOEIC®, lecciones con consejos, explicaciones, y actividades de práctica',
                    'Más de 1,000 preguntas del examen TOEIC®',
                    'Se integran unidades basadas en la habilidad auditiva, de lectura, gramática y expresión oral'
                ],
                modules: {
                    title: 'Está dividido en 3 Módulos',
                    levels: ['Principiante', 'Intermedio', 'Avanzado']
                },
                duration: {
                    title: 'Duración',
                    options: [
                        'Comprando 1 módulo: 60 días',
                        'Comprando 2 módulos: 120 días',
                        'Comprando 3 módulos: 180 días'
                    ],
                    note: 'El reloj comenzará a correr la primera vez que el usuario accede al sistema.'
                },
                sales: 'DE VENTA EN',
                email: 'ventas@toeic.mx'
            }
        },
        en: {
            title: 'TOEIC®Test Preparation Materials',
            subtitle: 'Prepare for success with official examinee handbooks, sample tests and other test prep materials.',
            officialCourse: {
                title: 'OFFICIAL TOEIC® ONLINE PREPARATION COURSE',
                buttonText: 'GO TO TEST',
                description: 'The Official TOEIC® Preparation Guide is an online course designed to help individuals develop the skills needed to succeed in the TOEIC® Listening and Reading test. It is the only online course developed by the creators of the TOEIC® certification, which contains up to 5 complete Listening and Reading tests.',
                features: [
                    'With more TOEIC® test content than any other online course',
                    'Introduction to TOEIC® tests, lessons with tips, explanations, and practice activities',
                    'More than 1,000 TOEIC® test questions',
                    'Integrated units based on listening, reading, grammar and speaking skills'
                ],
                modules: {
                    title: 'Divided into 3 Modules',
                    levels: ['Beginner', 'Intermediate', 'Advanced']
                },
                duration: {
                    title: 'Duration',
                    options: [
                        'Purchasing 1 module: 60 days',
                        'Purchasing 2 modules: 120 days',
                        'Purchasing 3 modules: 180 days'
                    ],
                    note: 'The clock will start running the first time the user accesses the system.'
                },
                sales: 'AVAILABLE AT',
                email: 'ventas@toeic.mx'
            }
        }
    };

    const currentTexts = texts[language];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="gradient-hero text-primary py-16 -mt-16 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-4">
                            {currentTexts.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-primary/90 mb-8 max-w-3xl mx-auto">
                            {currentTexts.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sample Test CTA Section */}
                <section className="py-8 mt-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 md:p-8">
                            <div className="text-center">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    {language === 'es' ? '¿Tienes 30 minutos?' : 'Do you have 30 min?'}
                                </h3>
                                <p className="text-lg text-white/90 mb-6">
                                    {language === 'es' 
                                        ? 'Toma el examen de ejemplo para conocer tu nivel actual'
                                        : 'Take the sample test to know your current level'
                                    }
                                </p>
                                <a 
                                    href="http://ets.toeicolpc.com/Intro.aspx?Uid=723100991001"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center bg-white text-primary-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                                >
                                    {language === 'es' ? 'COMENZAR EXAMEN DE EJEMPLO' : 'START SAMPLE TEST'}
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            {/* Official Course Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {currentTexts.officialCourse.title}
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 mb-12">
                            {/* Description */}
                            <div>
                                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {currentTexts.officialCourse.description}
                                </p>

                                {/* Features */}
                                <div className="space-y-3">
                                    {currentTexts.officialCourse.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modules and Duration */}
                            <div className="space-y-8">
                                {/* Modules */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        {currentTexts.officialCourse.modules.title}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentTexts.officialCourse.modules.levels.map((level, index) => (
                                            <div key={index} className="bg-primary-50 rounded-lg p-3 text-center">
                                                <span className="font-medium text-primary-900">{level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        {currentTexts.officialCourse.duration.title}
                                    </h3>
                                    <div className="space-y-2 mb-4">
                                        {currentTexts.officialCourse.duration.options.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                                <span className="text-gray-700">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 italic">
                                        {currentTexts.officialCourse.duration.note}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sales Contact */}
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                                <Mail className="h-5 w-5" />
                                {currentTexts.officialCourse.sales}
                            </div>
                            <a 
                                href={`mailto:${currentTexts.officialCourse.email}`}
                                className="text-primary-600 hover:text-primary-700 font-semibold text-lg"
                            >
                                {currentTexts.officialCourse.email}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <CallToAction />
        </div>
    );
}