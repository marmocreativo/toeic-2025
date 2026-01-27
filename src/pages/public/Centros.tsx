// src/pages/public/Centros.tsx
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../hooks/useLanguage';
import { getCentros, getCentrosEstados } from '../../services/centroService';
import type { CentroConEstado, CentroEstado } from '../../types/centro';
import  CallToAction from '../../components/public/CallToAction';
import { 
  MapPin, 
  Search, 
  Phone,
  Mail,
  Building2,
  X,
  Navigation,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area"

// Importar el archivo JSON local
import mexicoStatesGeoJSON from '../../data/mexico-states.json';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Centros() {
  const [centros, setCentros] = useState<CentroConEstado[]>([]);
  const [estados, setEstados] = useState<CentroEstado[]>([]);
  const [filteredCentros, setFilteredCentros] = useState<CentroConEstado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [selectedEstadoNombre, setSelectedEstadoNombre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const { language } = useLanguage();

  // Textos según el idioma
  const texts = {
    es: {
      title: 'Centros Autorizados',
      subtitle: 'Encuentra el centro TOEIC más cercano para realizar tu examen',
      searchPlaceholder: 'Buscar por nombre, dirección, teléfono...',
      mapInstruction: 'Haz clic en un estado para filtrar los centros',
      clearSelection: 'Limpiar selección',
      showAll: 'Mostrar todos',
      noResults: 'No se encontraron centros',
      noResultsDesc: 'Intenta con otros términos de búsqueda o selecciona otro estado',
      contact: 'Contactar',
      phone: 'Teléfono',
      email: 'Correo electrónico',
      address: 'Dirección',
      clearSearch: 'Limpiar Búsqueda',
      resultsCount: 'centros encontrados',
      resultsSingle: 'centro encontrado',
      in: 'en',
      centers: 'centros',
      center: 'centro',
      selectedState: 'Estado seleccionado',
      allStates: 'Todos los estados',
      ctaTitle: '¡No lo pienses más!',
      ctaDescription: 'Explora nuestros exámenes disponibles y programa tu evaluación.',
      ctaButton: 'Ver Exámenes',
      ctaSecondary: 'Ver Horarios',
      features: {
        authorized: 'Centros Oficiales',
        nationwide: 'Cobertura Nacional',
        support: 'Soporte Completo'
      },
      centersPerState: 'Centros por Estado'
    },
    en: {
      title: 'Authorized Centers',
      subtitle: 'Find the nearest TOEIC center to take your exam',
      searchPlaceholder: 'Search by name, address, phone...',
      mapInstruction: 'Click on a state to filter centers',
      clearSelection: 'Clear selection',
      showAll: 'Show all',
      noResults: 'No centers found',
      noResultsDesc: 'Try different search terms or select another state',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      clearSearch: 'Clear Search',
      resultsCount: 'centers found',
      resultsSingle: 'center found',
      in: 'in',
      centers: 'centers',
      center: 'center',
      selectedState: 'Selected state',
      allStates: 'All states',
      ctaTitle: 'Ready for Your TOEIC Exam?',
      ctaDescription: 'Explore our available tests and schedule your assessment.',
      ctaButton: 'View Tests',
      ctaSecondary: 'View Schedules',
      features: {
        authorized: 'Official Centers',
        nationwide: 'Nationwide Coverage',
        support: 'Complete Support'
      },
      centersPerState: 'Centers per State'
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

    if (searchTerm.trim()) {
      const searchText = searchTerm.toLowerCase();
      filtered = filtered.filter(centro => 
        centro.nombre.toLowerCase().includes(searchText) ||
        centro.direccion.toLowerCase().includes(searchText) ||
        (centro.telefono && centro.telefono.toLowerCase().includes(searchText)) ||
        (centro.correo && centro.correo.toLowerCase().includes(searchText)) ||
        (centro.telefono_alter && centro.telefono_alter.toLowerCase().includes(searchText)) ||
        (centro.correo_alter && centro.correo_alter.toLowerCase().includes(searchText)) ||
        (centro.estado && centro.estado.nombre.toLowerCase().includes(searchText))
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter(centro => 
        centro.estado && centro.estado.clave === selectedEstado
      );
    }

    setFilteredCentros(filtered);
  }, [searchTerm, selectedEstado, centros]);

  // Contar centros por estado para el mapa
  const centrosPorEstadoCount = useMemo(() => {
    const counts: Record<string, number> = {};
    centros.forEach(centro => {
      if (centro.estado) {
        counts[centro.estado.clave] = (counts[centro.estado.clave] || 0) + 1;
      }
    });
    return counts;
  }, [centros]);

  // Estilo para cada estado en el mapa
  const getStateStyle = (feature: any) => {
    const stateClave = feature.properties.clave || feature.properties.CLAVE || '';
    const count = centrosPorEstadoCount[stateClave] || 0;
    const isSelected = selectedEstado === stateClave;
    
    return {
      fillColor: isSelected ? '#1e40af' : count > 0 ? '#3b82f6' : '#e5e7eb',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#1e40af' : '#9ca3af',
      fillOpacity: isSelected ? 0.8 : count > 0 ? 0.6 : 0.3
    };
  };

  // Manejar interacciones con el mapa
  const onEachState = (feature: any, layer: any) => {
    const stateClave = feature.id || feature.properties.CLAVE || '';
    const stateName = feature.properties.name || feature.properties.ESTADO || feature.properties.NOM_ENT || '';
    const count = centrosPorEstadoCount[stateClave] || 0;
    
    // Configurar eventos
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        
        // Cambiar estilo al pasar el mouse
        if (selectedEstado !== stateClave) {
          layer.setStyle({
            fillOpacity: 0.8,
            weight: 2
          });
        }
        
        // Mostrar tooltip
        const tooltipContent = `
          <div style="text-align: center; padding: 5px;">
            <strong>${stateName}</strong> ${stateClave}<br/>
            ${count} ${count === 1 ? currentTexts.center : currentTexts.centers}
          </div>
        `;
        layer.bindTooltip(tooltipContent, { 
          sticky: true,
          direction: 'top',
          className: 'leaflet-tooltip-custom'
        }).openTooltip();
      },
      mouseout: (e: any) => {
        const layer = e.target;
        
        // Restaurar estilo al salir el mouse
        if (selectedEstado !== stateClave) {
          layer.setStyle({
            fillOpacity: count > 0 ? 0.6 : 0.3,
            weight: 1
          });
        }
        
        // Cerrar tooltip
        layer.closeTooltip();
      },
      click: (e: any) => {
        // Prevenir propagación del evento
        L.DomEvent.stopPropagation(e);
        
        // Solo permitir click si hay centros
        if (count > 0) {
          if (selectedEstado === stateClave) {
            // Deseleccionar si ya está seleccionado
            setSelectedEstado('');
            setSelectedEstadoNombre('');
          } else {
            // Seleccionar nuevo estado
            setSelectedEstado(stateClave);
            setSelectedEstadoNombre(stateName);
          }
        }
      }
    });
    
    // Cambiar cursor si hay centros
    if (count > 0) {
      layer.setStyle({ cursor: 'pointer' });
    }
  };

  // Manejar errores de imagen
  const handleImageError = (centroId: number) => {
    setImageErrors(prev => new Set(prev).add(centroId));
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = (centro: CentroConEstado): string => {
    if (!centro.imagen) return '';
    if (centro.imagen.startsWith('http') || centro.imagen.startsWith('/')) {
      return centro.imagen;
    }
    return `/images/centros/${centro.imagen}`;
  };

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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-12 w-1/3 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-[400px]" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      {/* Map and Search Section */}
      <section className="py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div>
              {/* Search and Stats */}
                <div className="space-y-4 mb-4">
                  <Card>
                    <CardContent className="p-6 py-2">
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <Input
                            type="text"
                            placeholder={currentTexts.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/5 rounded-lg p-4">
                            <div className="text-3xl font-bold text-primary">{centros.length} <span className="text-sm text-muted-foreground">{currentTexts.centers}</span></div>
                            
                          </div>
                          <div className="bg-primary/5 rounded-lg p-4">
                            <div className="text-3xl font-bold text-primary">{estados.length} <span className="text-sm text-muted-foreground">{currentTexts.allStates}</span></div>
                            
                          </div>
                        </div>

                        {/* Results count */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            {filteredCentros.length} {filteredCentros.length === 1 ? currentTexts.resultsSingle : currentTexts.resultsCount}
                            {selectedEstado && (
                              <span className="ml-1 font-medium text-primary">
                                {currentTexts.in} {selectedEstadoNombre}
                              </span>
                            )}
                          </p>
                          {(searchTerm || selectedEstado) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setSelectedEstado('');
                                setSelectedEstadoNombre('');
                              }}
                            >
                              {currentTexts.showAll}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Map */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-primary/5 px-4 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-5 h-5 text-primary" />
                          <p className="text-sm font-medium">{currentTexts.mapInstruction}</p>
                        </div>
                        {selectedEstado && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEstado('');
                              setSelectedEstadoNombre('');
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            {currentTexts.clearSelection}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="h-[400px] relative z-0">
                      <MapContainer
                        center={[23.6345, -102.5528]}
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <GeoJSON
                          key={`geojson-${selectedEstado}`}
                          data={mexicoStatesGeoJSON as any}
                          style={getStateStyle}
                          onEachFeature={onEachState}
                        />
                      </MapContainer>
                    </div>
                    {selectedEstado && (
                      <div className="bg-primary/5 px-4 py-3 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{currentTexts.selectedState}</Badge>
                            <span className="font-medium">{selectedEstadoNombre}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {centrosPorEstadoCount[selectedEstado] || 0} {currentTexts.centers}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </div>

            <div>
              <div className="max-w-7xl mx-auto px-4">
                <ScrollArea className="h-[700px] w-full rounded-md border p-4">
                {/* Centros agrupados por estado */}
                {Object.keys(centrosPorEstado).length > 0 ? (
                  <div className="space-y-12">
                    {Object.entries(centrosPorEstado).map(([estadoNombre, centrosEstado]) => (
                      <div key={estadoNombre}>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center">
                          <MapPin className="w-6 h-6 text-primary mr-2" />
                          {estadoNombre}
                          <Badge variant="outline" className="ml-3">
                            {centrosEstado.length} {centrosEstado.length === 1 ? currentTexts.center : currentTexts.centers}
                          </Badge>
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {centrosEstado.map((centro) => (
                            <Card key={centro.id} className="overflow-hidden hover:shadow-lg transition-shadow py-2">
                              <CardContent className='grid grid-cols-1 md:grid-cols-4 gap-4 p-2'>
                                  {/* Imagen del centro */}
                                  <div 
                                    className="h-32 relative bg-contain bg-no-repeat bg-center"
                                    style={{
                                      backgroundImage: centro.imagen && !imageErrors.has(centro.id) 
                                        ? `url(${getImageUrl(centro)})` 
                                        : 'none'
                                    }}
                                  >
                                    {(!centro.imagen || imageErrors.has(centro.id)) && (
                                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                        <Building2 className="w-12 h-12 text-primary/30" />
                                      </div>
                                    )}
                                    {centro.imagen && !imageErrors.has(centro.id) && (
                                      <img
                                        src={getImageUrl(centro)}
                                        alt={centro.nombre}
                                        className="hidden"
                                        onError={() => handleImageError(centro.id)}
                                      />
                                    )}
                                  </div>
                                  <div className="md:col-span-3 p-4">
                                    <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                                      {centro.nombre}
                                    </h3>

                                    <div className="space-y-2">
                                      {/* Dirección */}
                                      <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                          {centro.direccion}
                                        </p>
                                      </div>

                                      {/* Teléfono */}
                                      {centro.telefono && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          <a 
                                            href={`tel:${centro.telefono}`}
                                            className="text-xs text-primary hover:underline"
                                          >
                                            {centro.telefono}
                                          </a>
                                        </div>
                                      )}

                                      {/* Email */}
                                      {centro.correo && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          <a 
                                            href={`mailto:${centro.correo}`}
                                            className="text-xs text-primary hover:underline truncate"
                                          >
                                            {centro.correo}
                                          </a>
                                        </div>
                                      )}
                                      {/* Teléfono Alter */}
                                      {centro.telefono_alter && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          <a 
                                            href={`tel:${centro.telefono_alter}`}
                                            className="text-xs text-primary hover:underline"
                                          >
                                            {centro.telefono_alter}
                                          </a>
                                        </div>
                                      )}

                                      {/* Email Alter */}
                                      {centro.correo_alter && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          <a 
                                            href={`mailto:${centro.correo_alter}`}
                                            className="text-xs text-primary hover:underline truncate"
                                          >
                                            {centro.correo_alter}
                                          </a>
                                        </div>
                                      )}
                                    </div>
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
                  <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                      <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {currentTexts.noResults}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {currentTexts.noResultsDesc}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedEstado('');
                            setSelectedEstadoNombre('');
                          }}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {currentTexts.clearSearch}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CallToAction />
    </div>
  );
}