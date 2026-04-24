// src/pages/public/Contacto.tsx
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import WhatsAppFloat from '../../components/common/WhatsAppFloat';
import { 
  MapPin, 
  Phone,
  Mail,
  Send,
  CheckCircle,
} from 'lucide-react';

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
      subtitle: 'Estamos aquí para ayudarte con todas tus dudas sobre TOEIC®',
      formTitle: 'Envíanos un Mensaje',
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Enviar',
      sending: 'Enviando...',
      successTitle: '¡Mensaje Enviado!',
      successMessage: 'Te responderemos dentro de 24 horas.',
      contactInfo: 'Información de Contacto',
      address: 'GAUSS NO. 9 INT. 103 C, COLONIA ANZURES, DEL. MIGUEL HIDALGO, CIUDAD DE MÉXICO, C.P. 11590.',
      addressText: 'Ciudad de México, México',
      hours: 'Horarios',
      hoursText: 'Lun-Vie: 9:00 AM - 6:00 PM',
      phoneText: '(55) 5540 3555 - (55) 5540 3959',
      emailText: 'recepcion@toeic.mx',
      newMessage: 'Nuevo mensaje',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes o encuentra un centro autorizado.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Encontrar Centros',
      features: {
        support: 'Soporte 24/7',
        response: 'Respuesta Rápida',
        multilingual: 'Atención Bilingüe'
      },
      placeholders: {
        name: 'Tu nombre',
        email: 'tu@email.com',
        phone: '',
        subject: '',
        message: 'Escribe tu mensaje...'
      }
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We\'re here to help you with all your TOEIC® questions',
      formTitle: 'Send us a Message',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      sending: 'Sending...',
      successTitle: 'Message Sent!',
      successMessage: 'We\'ll respond within 24 hours.',
      contactInfo: 'Contact Information',
      address: 'GAUSS NO. 9 INT. 103 C, COLONIA ANZURES, DEL. MIGUEL HIDALGO, CIUDAD DE MÉXICO, C.P. 11590.',
      addressText: 'Mexico City, Mexico',
      hours: 'Hours',
      hoursText: 'Mon-Fri: 9:00 AM - 6:00 PM',
      phoneText: '(55) 5540 3555 - (55) 5540 3959',
      emailText: 'recepcion@toeic.mx',
      newMessage: 'New message',
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
        name: 'Your name',
        email: 'your@email.com',
        phone: '',
        subject: '',
        message: 'Write your message...'
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

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  // Aquí está la corrección - definir interfaces más claras
  interface ContactMethod {
    icon: any;
    title: string;
    color: string;
    bgColor: string;
    isClickable: boolean;
    action?: () => void;
  }

  const contactMethods: ContactMethod[] = [
    {
      icon: Phone,
      title: currentTexts.phoneText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      isClickable: true,
      action: () => window.open(`tel:${currentTexts.phoneText}`)
    },
    {
      icon: Mail,
      title: currentTexts.emailText,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      isClickable: true,
      action: () => window.open(`mailto:${currentTexts.emailText}`)
    }
  ];

  return (
    <div className="min-h-screen bg-bg">
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

      {/* Main Content - Muy Compacto */}
      <section className="py-8 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Contact Form - 2 columnas */}
            <div className="lg:col-span-2">
              <div className="bg-bg-light rounded-lg shadow-md border border-border p-6">
                <h2 className="text-2xl font-medium text-primary mb-4">
                  {currentTexts.formTitle}
                </h2>
                
                {isSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {currentTexts.successTitle}
                    </h3>
                    <p className="text-text-muted mb-4">
                      {currentTexts.successMessage}
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="btn-outline-primary px-4 py-2"
                    >
                      {currentTexts.newMessage}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grid compacto 2x2 para los primeros campos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          {currentTexts.name} *
                        </label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          placeholder={currentTexts.placeholders.name}
                          className="input text-sm h-10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          {currentTexts.email} *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={currentTexts.placeholders.email}
                          className="input text-sm h-10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          {currentTexts.phone}
                        </label>
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder={currentTexts.placeholders.phone}
                          className="input text-sm h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          {currentTexts.subject} *
                        </label>
                        <input
                          type="text"
                          value={formData.asunto}
                          onChange={(e) => handleInputChange('asunto', e.target.value)}
                          placeholder={currentTexts.placeholders.subject}
                          className="input text-sm h-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        {currentTexts.message} *
                      </label>
                      <textarea
                        rows={4}
                        value={formData.mensaje}
                        onChange={(e) => handleInputChange('mensaje', e.target.value)}
                        placeholder={currentTexts.placeholders.message}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-light text-text text-sm resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="btn-primary w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-pulse" />
                          {currentTexts.sending}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {currentTexts.send}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Information - 1 columna */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-primary mb-4">
                {currentTexts.contactInfo}
              </h2>

              {/* Contact Methods - Compactos - CORRECCIÓN AQUÍ */}
              <div className="space-y-3">
                {contactMethods.map((method, index) => (
                  <div 
                    key={index} 
                    className={`bg-bg-light rounded-lg border border-border p-3 hover:shadow-md transition-shadow ${method.isClickable ? 'cursor-pointer hover:border-primary/30' : ''}`}
                    onClick={method.isClickable ? method.action : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${method.bgColor} rounded-lg p-2 flex-shrink-0`}>
                        <method.icon className={`w-4 h-4 ${method.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {method.title}
                        </p>
                      </div>
                      {method.isClickable && (
                        <div className="text-text-muted">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder Compacto */}
              <div className="bg-accent/10 rounded-lg p-4 text-center border border-accent/20">
                <MapPin className="w-8 h-8 text-accent-dark mx-auto mb-2" />
                <h3 className="font-medium text-text mb-1 text-sm">
                  {currentTexts.address}
                </h3>
                <p className="text-text-muted text-xs mb-3">
                  {currentTexts.addressText}
                </p>
                <button 
                  className="inline-flex items-center px-3 py-1 bg-accent hover:bg-accent-dark text-black text-xs font-medium rounded transition-colors"
                  onClick={() => window.open('https://maps.app.goo.gl/MZLm2fDhupSeJyZP7', '_blank')}
                >
                  {language === 'es' ? 'Ver Mapa' : 'View Map'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <WhatsAppFloat/>
    </div>
  );
}