// src/components/public/HorariosGrid.tsx
import { Calendar, Clock, Building2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface HorariosGridProps {
  horarios: any[];
  onRegisterClick: () => void;
}

export default function HorariosGrid({ horarios, onRegisterClick }: HorariosGridProps) {
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
          <button
            onClick={onRegisterClick}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4" />
            {currentTexts.registerNow}
          </button>
        </div>
      </div>
    </div>
  );
}