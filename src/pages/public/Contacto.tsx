// src/pages/public/Contacto.tsx
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { 
  MapPin, 
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building2,
  BookOpen,
  MessageSquare,
  Globe,
  Users,
  HeadphonesIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte con todas tus dudas sobre TOEIC',
      formTitle: 'Envíanos un Mensaje',
      formSubtitle: 'Completa el formulario y te responderemos a la brevedad',
      name: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono (opcional)',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      sending: 'Enviando...',
      successTitle: '¡Mensaje Enviado!',
      successMessage: 'Gracias por contactarnos. Te responderemos dentro de 24 horas.',
      contactInfo: 'Información de Contacto',
      address: 'Dirección',
      addressText: 'Ciudad de México, México',
      hours: 'Horarios de Atención',
      hoursText: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
      phoneText: '+52 55 1234 5678',
      emailText: 'info@toeic2025.mx',
      ctaTitle: '¿Necesitas Información Inmediata?',
      ctaDescription: 'Explora nuestros exámenes o encuentra un centro autorizado.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros',
      features: {
        support: 'Soporte 24/7',
        response: 'Respuesta Rápida',
        multilingual: 'Atención Bilingüe'
      },
      placeholders: {
        name: 'Tu nombre completo',
        email: 'tucorreo@ejemplo.com',
        phone: '+52 55 1234 5678',
        subject: 'Información sobre exámenes TOEIC',
        message: 'Escribe tu mensaje aquí...'
      }
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We\'re here to help you with all your TOEIC questions',
      formTitle: 'Send us a Message',
      formSubtitle: 'Fill out the form and we\'ll get back to you shortly',
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone (optional)',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
      successTitle: 'Message Sent!',
      successMessage: 'Thank you for contacting us. We\'ll respond within 24 hours.',
      contactInfo: 'Contact Information',
      address: 'Address',
      addressText: 'Mexico City, Mexico',
      hours: 'Business Hours',
      hoursText: 'Monday to Friday: 9:00 AM - 6:00 PM',
      phoneText: '+52 55 1234 5678',
      emailText: 'info@toeic2025.mx',
      ctaTitle: 'Need Immediate Information?',
      ctaDescription: 'Explore our tests or find an authorized center.',
      ctaButton: 'View Tests',
      ctaSecondary: 'Find Centers',
      features: {
        support: '24/7 Support',
        response: 'Quick Response',
        multilingual: 'Bilingual Service'
      },
      placeholders: {
        name: 'Your full name',
        email: 'your.email@example.com',
        phone: '+52 55 1234 5678',
        subject: 'TOEIC exam information',
        message: 'Write your message here...'
      }
    }
  };

  const currentTexts = texts[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío del formulario
    // En producción, aquí enviarías los datos a tu API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      setIsSubmitted(true);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: MapPin,
      title: currentTexts.address,
      content: currentTexts.addressText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => window.open('https://maps.google.com', '_blank')
    },
    {
      icon: Phone,
      title: currentTexts.phoneText,
      content: language === 'es' ? 'Llamar ahora' : 'Call now',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => window.open(`tel:${currentTexts.phoneText}`)
    },
    {
      icon: Mail,
      title: currentTexts.emailText,
      content: language === 'es' ? 'Enviar email' : 'Send email',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => window.open(`mailto:${currentTexts.emailText}`)
    },
    {
      icon: Clock,
      title: currentTexts.hours,
      content: currentTexts.hoursText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {currentTexts.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {currentTexts.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <HeadphonesIcon className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.support}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <MessageSquare className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.response}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Globe className="w-8 h-8 text-purple-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.multilingual}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentTexts.formTitle}
                  </CardTitle>
                  <p className="text-gray-600">
                    {currentTexts.formSubtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {currentTexts.successTitle}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {currentTexts.successMessage}
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                      >
                        Enviar otro mensaje
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Nombre */}
                      <div>
                        <Label htmlFor="nombre">{currentTexts.name} *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          placeholder={currentTexts.placeholders.name}
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email">{currentTexts.email} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={currentTexts.placeholders.email}
                          required
                        />
                      </div>

                      {/* Teléfono */}
                      <div>
                        <Label htmlFor="telefono">{currentTexts.phone}</Label>
                        <Input
                          id="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder={currentTexts.placeholders.phone}
                        />
                      </div>

                      {/* Asunto */}
                      <div>
                        <Label htmlFor="asunto">{currentTexts.subject} *</Label>
                        <Input
                          id="asunto"
                          value={formData.asunto}
                          onChange={(e) => handleInputChange('asunto', e.target.value)}
                          placeholder={currentTexts.placeholders.subject}
                          required
                        />
                      </div>

                      {/* Mensaje */}
                      <div>
                        <Label htmlFor="mensaje">{currentTexts.message} *</Label>
                        <Textarea
                          id="mensaje"
                          rows={5}
                          value={formData.mensaje}
                          onChange={(e) => handleInputChange('mensaje', e.target.value)}
                          placeholder={currentTexts.placeholders.message}
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {currentTexts.sending}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {currentTexts.send}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentTexts.contactInfo}
                </h2>
              </div>

              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card 
                    key={index} 
                    className={`hover:shadow-md transition-shadow ${method.action ? 'cursor-pointer' : ''}`}
                    onClick={method.action || undefined}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`${method.bgColor} rounded-lg p-3`}>
                          <method.icon className={`w-6 h-6 ${method.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {method.title}
                          </h3>
                          <p className="text-gray-600">
                            {method.content}
                          </p>
                        </div>
                        {method.action && (
                          <div className="text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {language === 'es' ? 'Ubicación' : 'Location'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {currentTexts.addressText}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3"
                        onClick={() => window.open('https://maps.google.com', '_blank')}
                      >
                        {language === 'es' ? 'Ver en Mapa' : 'View on Map'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {currentTexts.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {currentTexts.ctaDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <a href={generateLocalizedPath('examenes', language)}>
                <BookOpen className="w-5 h-5 mr-2" />
                {currentTexts.ctaButton}
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <a href={generateLocalizedPath('centros', language)}>
                <Building2 className="w-5 h-5 mr-2" />
                {currentTexts.ctaSecondary}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}