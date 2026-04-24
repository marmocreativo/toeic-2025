// src/pages/public/FechasAplicacion.tsx

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Building2, RefreshCw, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { getFechasAplicacionesPublicas } from '../../services/fechaAplicacionService';
import { getCentros } from '../../services/centroService';
import type { FechaAplicacion } from '../../types/fechaAplicacion';
import type { CentroConEstado } from '../../types/centro';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CallToAction from '../../components/public/CallToAction';

const texts = {
  es: {
    title: 'Fechas de Aplicación',
    subtitle: 'Consulta las fechas disponibles para presentar tu examen TOEIC®',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    specific: 'Específica',
    recurrent: 'Recurrente',
    general: 'General',
    allCenters: 'Todos los centros',
    noEvents: 'No hay fechas este mes',
    selectedDay: 'Fechas del',
    noSelectedDay: 'Selecciona un día para ver los detalles',
  },
  en: {
    title: 'Application Dates',
    subtitle: 'Check the available dates to take your TOEIC® exam',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    specific: 'Specific',
    recurrent: 'Recurring',
    general: 'General',
    allCenters: 'All centers',
    noEvents: 'No dates this month',
    selectedDay: 'Dates for',
    noSelectedDay: 'Select a day to see details',
  },
};

// ─── Helpers para calcular recurrencias ───────────────────────────────────────

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const diff = (lastDay.getDay() - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - diff);
}

function getFirstWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const firstDay = new Date(year, month, 1);
  const diff = (weekday - firstDay.getDay() + 7) % 7;
  return new Date(year, month, 1 + diff);
}

// Devuelve las fechas concretas que genera una FechaAplicacion en un mes dado
function resolverFechasDelMes(fecha: FechaAplicacion, year: number, month: number): Date[] {
  // Fecha específica
  if (fecha.fecha) {
    const d = new Date(`${fecha.fecha}T00:00:00`);
    if (d.getFullYear() === year && d.getMonth() === month) return [d];
    return [];
  }

  // Recurrentes
  if (fecha.tipo_recurrencia === 'dia_mes' && fecha.dia_mes) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (fecha.dia_mes > daysInMonth) return [];
    return [new Date(year, month, fecha.dia_mes)];
  }

  if (fecha.tipo_recurrencia === 'ultimo_dia_semana' && fecha.dia_semana !== null) {
    return [getLastWeekdayOfMonth(year, month, fecha.dia_semana!)];
  }

  if (fecha.tipo_recurrencia === 'primer_dia_semana' && fecha.dia_semana !== null) {
    return [getFirstWeekdayOfMonth(year, month, fecha.dia_semana!)];
  }

  return [];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FechasAplicacion() {
  const { language } = useLanguage();
  const t = texts[language];

  const [fechas, setFechas] = useState<FechaAplicacion[]>([]);
  const [centros, setCentros] = useState<CentroConEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fechasData, centrosData] = await Promise.all([
          getFechasAplicacionesPublicas(),
          getCentros(),
        ]);
        setFechas(fechasData);
        setCentros(centrosData.filter(c => c.publicado));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Mapa día → lista de fechas para el mes actual
  const eventsByDay = useMemo(() => {
    const map: Record<number, { fecha: FechaAplicacion; date: Date }[]> = {};
    fechas.forEach(f => {
      const dates = resolverFechasDelMes(f, currentYear, currentMonth);
      dates.forEach(d => {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({ fecha: f, date: d });
      });
    });
    return map;
  }, [fechas, currentYear, currentMonth]);

  // Construcción del grid del calendario
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const gridCells = firstDayOfMonth + daysInMonth;
  const totalCells = Math.ceil(gridCells / 7) * 7;

  const prevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const getCentroNombre = (fecha: FechaAplicacion) => {
    if (!fecha.id_centro) return t.allCenters;
    return centros.find(c => c.id === fecha.id_centro)?.nombre ?? `Centro #${fecha.id_centro}`;
  };

  const getCentroEstado = (fecha: FechaAplicacion) => {
    if (!fecha.id_centro) return null;
    return centros.find(c => c.id === fecha.id_centro)?.estado?.nombre ?? null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="gradient-hero py-16 -mt-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-14 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-7 w-2/3 mx-auto" />
          </div>
        </section>
        <section className="py-8 bg-muted/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-[520px] w-full rounded-xl" />
          </div>
        </section>
      </div>
    );
  }

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];
  const hasEventsThisMonth = Object.keys(eventsByDay).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-hero text-primary py-16 -mt-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-primary/90 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Calendario */}
      <section className="py-10 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Grid del calendario */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {/* Navegación mes */}
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-semibold text-primary">
                      {t.months[currentMonth]} {currentYear}
                    </h2>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Encabezados días */}
                  <div className="grid grid-cols-7 mb-2">
                    {t.days.map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Celdas */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: totalCells }).map((_, i) => {
                      const day = i - firstDayOfMonth + 1;
                      const isValid = day >= 1 && day <= daysInMonth;
                      const hasEvents = isValid && !!eventsByDay[day];
                      const isSelected = isValid && selectedDay === day;
                      const isTodayCell = isValid && isToday(day);
                      const eventCount = hasEvents ? eventsByDay[day].length : 0;

                      return (
                        <button
                          key={i}
                          disabled={!isValid || !hasEvents}
                          onClick={() => isValid && setSelectedDay(day === selectedDay ? null : day)}
                          className={`
                            relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all
                            ${!isValid ? 'invisible' : ''}
                            ${isSelected
                              ? 'bg-primary text-white shadow-md'
                              : hasEvents
                                ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
                                : 'text-muted-foreground cursor-default'
                            }
                            ${isTodayCell && !isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                          `}
                        >
                          <span>{isValid ? day : ''}</span>
                          {hasEvents && (
                            <div className="flex gap-0.5 mt-0.5">
                              {Array.from({ length: Math.min(eventCount, 3) }).map((_, j) => (
                                <span
                                  key={j}
                                  className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sin eventos */}
                  {!hasEventsThisMonth && (
                    <p className="text-center text-muted-foreground text-sm mt-4">
                      {t.noEvents}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Panel lateral de detalles */}
            <div className="space-y-4">
              {selectedDay && selectedEvents.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t.selectedDay} {selectedDay} {t.months[currentMonth]}
                  </h3>
                  {selectedEvents.map(({ fecha }, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-2">
                        {/* Centro */}
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-sm text-foreground">
                            {getCentroNombre(fecha)}
                          </span>
                        </div>

                        {/* Estado */}
                        {getCentroEstado(fecha) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {getCentroEstado(fecha)}
                            </span>
                          </div>
                        )}

                        {/* Hora */}
                        {fecha.hora && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{fecha.hora}</span>
                          </div>
                        )}

                        {/* Notas */}
                        {fecha.notas && (
                          <p className="text-xs text-muted-foreground italic">{fecha.notas}</p>
                        )}

                        {/* Badges */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          <Badge
                            variant="outline"
                            className={fecha.tipo_recurrencia
                              ? 'border-secondary/40 text-secondary text-xs'
                              : 'border-primary/40 text-primary text-xs'
                            }
                          >
                            {fecha.tipo_recurrencia
                              ? <><RefreshCw className="w-3 h-3 mr-1" />{t.recurrent}</>
                              : <><Calendar className="w-3 h-3 mr-1" />{t.specific}</>
                            }
                          </Badge>
                          {!fecha.id_centro && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              🌐 {t.general}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">{t.noSelectedDay}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}