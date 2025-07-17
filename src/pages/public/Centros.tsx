// src/pages/public/Centros.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      clearSearch: 'Limpiar Búsqueda',
      clearFilters: 'Limpiar Filtros',
      resultsCount: 'centros encontrados',
      resultsSingle: 'centro encontrado',
      in: 'en',
      centers: 'centros',
      center: 'centro',
      ctaTitle: '¡No lo pienses más!',
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
      clearSearch: 'Clear Search',
      clearFilters: 'Clear Filters',
      resultsCount: 'centers found',
      resultsSingle: 'center found',
      in: 'in',
      centers: 'centers',
      center: 'center',
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
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-border rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-bg-light rounded-lg shadow-md p-4">
                  <div className="h-5 bg-border rounded mb-2"></div>
                  <div className="h-3 bg-border rounded mb-2"></div>
                  <div className="h-3 bg-border rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder={currentTexts.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-light border border-border"
                  />
                </div>
                
                {/* Estado Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-bg-light border border-border"
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
      <section className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x-1 divide-solid divide-white">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.authorized}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Globe className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.nationwide}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-white">
                {currentTexts.features.support}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Centros Section */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-secondary">
              {filteredCentros.length} {filteredCentros.length === 1 ? currentTexts.resultsSingle : currentTexts.resultsCount}
              {selectedEstado && (
                <span className="ml-2 text-primary">
                  {currentTexts.in} {estados.find(e => e.id.toString() === selectedEstado)?.nombre}
                </span>
              )}
            </p>
          </div>

          {/* Centros agrupados por estado */}
          {Object.keys(centrosPorEstado).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(centrosPorEstado).map(([estadoNombre, centrosEstado]) => (
                <div key={estadoNombre}>
                  <h2 className="text-2xl font-medium text-primary mb-6 flex items-center">
                    <MapPin className="w-6 h-6 text-accent mr-2" />
                    {estadoNombre}
                    <span className="ml-2 text-sm font-normal text-text-muted">
                      ({centrosEstado.length} {centrosEstado.length === 1 ? currentTexts.center : currentTexts.centers})
                    </span>
                  </h2>
                  
                  {/* Grid compacto - 4 columnas en desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {centrosEstado.map((centro) => (
                      <div 
                        key={centro.id} 
                        className="bg-bg-light rounded-lg shadow-md border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 group p-4"
                      >
                        {/* Header compacto */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-text group-hover:text-primary transition-colors leading-tight text-sm">
                              {centro.nombre}
                            </h3>
                            <p className="text-xs text-text-muted mt-1">
                              Centro Autorizado TOEIC
                            </p>
                          </div>
                        </div>

                        {/* Información compacta */}
                        <div className="space-y-2 mb-3">
                          {/* Dirección */}
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                              {centro.direccion}
                            </p>
                          </div>

                          {/* Teléfono */}
                          {centro.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-text-muted flex-shrink-0" />
                              <a 
                                href={`tel:${centro.telefono}`}
                                className="text-xs text-primary hover:text-primary-dark transition-colors"
                              >
                                {centro.telefono}
                              </a>
                            </div>
                          )}

                          {/* Email */}
                          {centro.correo && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-text-muted flex-shrink-0" />
                              <a 
                                href={`mailto:${centro.correo}`}
                                className="text-xs text-primary hover:text-primary-dark transition-colors truncate"
                              >
                                {centro.correo}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Botón compacto */}
                        <button 
                          className="w-full px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors"
                          onClick={() => {
                            if (centro.telefono) {
                              window.open(`tel:${centro.telefono}`);
                            } else if (centro.correo) {
                              window.open(`mailto:${centro.correo}`);
                            }
                          }}
                        >
                          {currentTexts.contact}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-border mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">
                {currentTexts.noResults}
              </h3>
              <p className="text-text-muted mb-6">
                {currentTexts.noResultsDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-primary"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {currentTexts.clearSearch}
                </button>
                <button
                  onClick={() => setSelectedEstado('')}
                  className="btn-outline-primary"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {currentTexts.clearFilters}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

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
                  to={generateLocalizedPath('examenes', language)}
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