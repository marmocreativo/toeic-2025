// src/pages/public/Centros.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { generateLocalizedPath } from '../../utils/languageUtils';
import { getCentros, getCentrosEstados } from '../../services/centroService';
import type { CentroConEstado, CentroEstado } from '../../types/centro';
import { 
  MapPin, 
  Search, 
  Phone,
  Mail,
  Building2,
  BookOpen,
  Filter,
  Users,
  Globe,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Centros() {
  const [centros, setCentros] = useState<CentroConEstado[]>([]);
  const [estados, setEstados] = useState<CentroEstado[]>([]);
  const [filteredCentros, setFilteredCentros] = useState<CentroConEstado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'Centros Autorizados',
      subtitle: 'Encuentra el centro TOEIC más cercano para realizar tu examen',
      searchPlaceholder: 'Buscar centros...',
      filterByState: 'Filtrar por estado',
      allStates: 'Todos los estados',
      noResults: 'No se encontraron centros',
      noResultsDesc: 'Intenta con otros términos de búsqueda o filtros',
      contact: 'Contactar',
      phone: 'Teléfono',
      email: 'Correo electrónico',
      address: 'Dirección',
      ctaTitle: '¿Listo para tu Examen TOEIC?',
      ctaDescription: 'Explora nuestros exámenes disponibles y programa tu evaluación.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Ver Horarios',
      features: {
        authorized: 'Centros Oficiales',
        nationwide: 'Cobertura Nacional',
        support: 'Soporte Completo'
      }
    },
    en: {
      title: 'Authorized Centers',
      subtitle: 'Find the nearest TOEIC center to take your exam',
      searchPlaceholder: 'Search centers...',
      filterByState: 'Filter by state',
      allStates: 'All states',
      noResults: 'No centers found',
      noResultsDesc: 'Try different search terms or filters',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      ctaTitle: 'Ready for Your TOEIC Exam?',
      ctaDescription: 'Explore our available tests and schedule your assessment.',
      ctaButton: 'View Tests',
      ctaSecondary: 'View Schedules',
      features: {
        authorized: 'Official Centers',
        nationwide: 'Nationwide Coverage',
        support: 'Complete Support'
      }
    }
  };

  const currentTexts = texts[language];

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [centrosData, estadosData] = await Promise.all([
          getCentros(),
          getCentrosEstados()
        ]);
        
        // Filtrar solo centros y estados publicados
        const centrosPublicados = centrosData.filter(centro => centro.publicado);
        const estadosPublicados = estadosData.filter(estado => estado.publicado);
        
        setCentros(centrosPublicados);
        setEstados(estadosPublicados);
        setFilteredCentros(centrosPublicados);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrar centros
  useEffect(() => {
    let filtered = centros;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const searchText = searchTerm.toLowerCase();
      filtered = filtered.filter(centro => 
        centro.nombre.toLowerCase().includes(searchText) ||
        centro.direccion.toLowerCase().includes(searchText) ||
        (centro.telefono && centro.telefono.toLowerCase().includes(searchText)) ||
        (centro.correo && centro.correo.toLowerCase().includes(searchText)) ||
        (centro.estado && centro.estado.nombre.toLowerCase().includes(searchText))
      );
    }

    // Filtro por estado
    if (selectedEstado) {
      filtered = filtered.filter(centro => 
        centro.estado && centro.estado.id.toString() === selectedEstado
      );
    }

    setFilteredCentros(filtered);
  }, [searchTerm, selectedEstado, centros]);

  // Agrupar centros por estado
  const centrosPorEstado = filteredCentros.reduce((acc, centro) => {
    const estadoNombre = centro.estado?.nombre || 'Sin estado';
    if (!acc[estadoNombre]) {
      acc[estadoNombre] = [];
    }
    acc[estadoNombre].push(centro);
    return acc;
  }, {} as Record<string, CentroConEstado[]>);

  // Componente de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={currentTexts.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                
                {/* Estado Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">{currentTexts.allStates}</option>
                    {estados.map(estado => (
                      <option key={estado.id} value={estado.id.toString()}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.authorized}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Globe className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.nationwide}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-lg font-semibold text-gray-700">
                {currentTexts.features.support}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Centros Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              {filteredCentros.length} {filteredCentros.length === 1 ? 'centro encontrado' : 'centros encontrados'}
              {selectedEstado && (
                <span className="ml-2 text-blue-600">
                  en {estados.find(e => e.id.toString() === selectedEstado)?.nombre}
                </span>
              )}
            </p>
          </div>

          {/* Centros agrupados por estado */}
          {Object.keys(centrosPorEstado).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(centrosPorEstado).map(([estadoNombre, centrosEstado]) => (
                <div key={estadoNombre}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                    {estadoNombre}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({centrosEstado.length} {centrosEstado.length === 1 ? 'centro' : 'centros'})
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centrosEstado.map((centro) => (
                      <Card key={centro.id} className="hover:shadow-lg transition-shadow duration-300 group">
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                  {centro.nombre}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Centro Autorizado TOEIC
                                </p>
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Dirección */}
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {centro.direccion}
                            </p>
                          </div>

                          {/* Teléfono */}
                          {centro.telefono && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a 
                                href={`tel:${centro.telefono}`}
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {centro.telefono}
                              </a>
                            </div>
                          )}

                          {/* Email */}
                          {centro.correo && (
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a 
                                href={`mailto:${centro.correo}`}
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors truncate"
                              >
                                {centro.correo}
                              </a>
                            </div>
                          )}

                          {/* Botón de contacto */}
                          <div className="pt-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                if (centro.telefono) {
                                  window.open(`tel:${centro.telefono}`);
                                } else if (centro.correo) {
                                  window.open(`mailto:${centro.correo}`);
                                }
                              }}
                            >
                              {currentTexts.contact}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentTexts.noResults}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentTexts.noResultsDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Limpiar Búsqueda
                </button>
                <button
                  onClick={() => setSelectedEstado('')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
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
              <a href={generateLocalizedPath('examenes', language)}>
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