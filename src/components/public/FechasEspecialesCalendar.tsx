// src/components/public/FechasEspecialesCalendar.tsx
import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { ExamenFechaEspecial } from '../../types/examen';

interface Props {
  titulo: string;
  fechasEspeciales: ExamenFechaEspecial[];
}

export default function FechasEspecialesCalendar({ titulo, fechasEspeciales }: Props) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const texts = {
    es: {
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      prevMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      availableAt: 'Disponible a las',
      datesThisMonth: 'Fechas este mes:',
      availableDates: 'Fechas disponibles'
    },
    en: {
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      availableAt: 'Available at',
      datesThisMonth: 'Dates this month:',
      availableDates: 'Available dates'
    }
  };

  const currentTexts = texts[language];

  // Si no hay título, no mostrar el componente
  if (!titulo || titulo.trim() === '') {
    return null;
  }

  // Filtrar solo fechas publicadas Y futuras (que no han pasado)
  const fechasPublicadas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas
    
    return fechasEspeciales?.filter(f => {
      if (!f.publicado) return false;
      
      const fechaExamen = new Date(f.fecha);
      fechaExamen.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas
      
      // Solo mostrar fechas de hoy en adelante
      return fechaExamen >= hoy;
    }) || [];
  }, [fechasEspeciales]);

  // Si no hay fechas especiales, no mostrar el componente
  if (fechasPublicadas.length === 0) {
    return null;
  }

  // Funciones del calendario
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Crear mapa de fechas especiales para el mes actual
  const fechasDelMes = useMemo(() => {
    const fechaMap = new Map<string, ExamenFechaEspecial[]>();
    
    fechasPublicadas.forEach(fecha => {
      const fechaObj = new Date(fecha.fecha);
      if (
        fechaObj.getFullYear() === currentDate.getFullYear() &&
        fechaObj.getMonth() === currentDate.getMonth()
      ) {
        const key = fechaObj.getDate().toString();
        if (!fechaMap.has(key)) {
          fechaMap.set(key, []);
        }
        fechaMap.get(key)!.push(fecha);
      }
    });
    
    return fechaMap;
  }, [fechasPublicadas, currentDate]);

  // Obtener fechas del mes actual para mostrar detalles
  const fechasDelMesActual = useMemo(() => {
    return fechasPublicadas.filter(fecha => {
      const fechaObj = new Date(fecha.fecha);
      return (
        fechaObj.getFullYear() === currentDate.getFullYear() &&
        fechaObj.getMonth() === currentDate.getMonth()
      );
    }).sort((a, b) => new Date(a.fecha).getDate() - new Date(b.fecha).getDate());
  }, [fechasPublicadas, currentDate]);

  // Generar días del calendario
  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = lastDayOfMonth.getDate();

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 bg-gray-50"></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const fechasDelDia = fechasDelMes.get(day.toString()) || [];
      const tieneFechas = fechasDelDia.length > 0;

      days.push(
        <div
          key={day}
          className={`h-12 border border-gray-100 flex flex-col items-center justify-center relative transition-colors ${
            tieneFechas 
              ? 'bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/20' 
              : 'bg-white hover:bg-gray-50'
          }`}
          title={
            tieneFechas 
              ? fechasDelDia.map(f => 
                  `${currentTexts.availableAt} ${f.hora || 'Sin hora'}`
                ).join(', ')
              : undefined
          }
        >
          <span className={`text-sm font-medium ${
            tieneFechas ? 'text-primary' : 'text-gray-700'
          }`}>
            {day}
          </span>
          
          {tieneFechas && (
            <div className="absolute bottom-1 flex gap-0.5">
              {fechasDelDia.slice(0, 3).map((_, index) => (
                <div 
                  key={index}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
              ))}
              {fechasDelDia.length > 3 && (
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-bg-light rounded-lg shadow-md border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {titulo}
        </h3>
      </div>

      <div className="p-4">
        {/* Controles del calendario */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={currentTexts.prevMonth}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <h4 className="text-lg font-semibold text-text">
            {currentTexts.months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={currentTexts.nextMonth}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Calendario */}
        <div className="mb-4">
          {/* Headers de días */}
          <div className="grid grid-cols-7 mb-1">
            {currentTexts.daysShort.map(day => (
              <div 
                key={day} 
                className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del calendario */}
          <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
            {generateCalendarDays()}
          </div>
        </div>

        {/* Lista de fechas del mes actual */}
        {fechasDelMesActual.length > 0 && (
          <div className="border-t border-border pt-4">
            <h5 className="text-sm font-medium text-text mb-3">
              {currentTexts.datesThisMonth}
            </h5>
            <div className="space-y-2">
              {fechasDelMesActual.map((fecha, index) => {
                const fechaObj = new Date(fecha.fecha);
                const dia = fechaObj.getDate();
                const nombreDia = fechaObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                  weekday: 'long' 
                });

                return (
                  <div 
                    key={index}
                    className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-text text-sm capitalize">
                        {nombreDia} {dia}
                      </div>
                      {fecha.hora && (
                        <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {fecha.hora}
                        </div>
                      )}
                    </div>
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4 pt-3 border-t border-border">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>{currentTexts.availableDates}</span>
        </div>
      </div>
    </div>
  );
}