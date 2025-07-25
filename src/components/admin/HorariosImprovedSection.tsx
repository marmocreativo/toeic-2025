import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import type { ExamenHorarioFormData } from '../../types/examen';
import { 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Check,
  X
} from 'lucide-react';

// Definir tipos para el horario mejorado
interface HorarioConfig {
  dias: string[];
  horas: string[];
  publicado: boolean;
}

interface HorarioPersonalizado {
  dia: string;
  hora: string;
  publicado: boolean;
}

interface HorariosImprovedProps {
  formData: {
    horarios?: ExamenHorarioFormData[];
  };
  onHorariosChange: (horarios: ExamenHorarioFormData[]) => void;
}

const HorariosImprovedSection: React.FC<HorariosImprovedProps> = ({ 
  formData, 
  onHorariosChange 
}) => {
  // Días de la semana
  const diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miércoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sábado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  // Horarios predefinidos
  const horariosStandard = [
    '9:30',
    '12:30', 
    '15:30'
  ];

  // Estados locales
  const [selectedDias, setSelectedDias] = useState<string[]>([]);
  const [selectedHoras, setSelectedHoras] = useState<string[]>([]);
  const [horariosPersonalizados, setHorariosPersonalizados] = useState<HorarioPersonalizado[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState({ dia: '', hora: '' });

  // Inicializar desde formData existente
  useEffect(() => {
    if (formData.horarios && formData.horarios.length > 0) {
      parseExistingHorarios();
    }
  }, []);

  const parseExistingHorarios = () => {
    const personalizados: HorarioPersonalizado[] = [];
    const diasSet = new Set<string>();
    const horasSet = new Set<string>();

    formData.horarios?.forEach(horario => {
      if (horario.dia && horario.hora) {
        // Si es un día y hora estándar, agregarlo a selecciones
        const diaKey = horario.dia.toLowerCase();
        const diaStandard = diasSemana.find(d => d.key === diaKey || d.label === horario.dia);
        const horaStandard = horariosStandard.includes(horario.hora);

        if (diaStandard && horaStandard) {
          diasSet.add(diaStandard.key);
          horasSet.add(horario.hora);
        } else {
          // Si no es estándar, agregarlo como personalizado
          personalizados.push({
            dia: horario.dia,
            hora: horario.hora,
            publicado: horario.publicado || true
          });
        }
      }
    });

    setSelectedDias(Array.from(diasSet));
    setSelectedHoras(Array.from(horasSet));
    setHorariosPersonalizados(personalizados);
  };

  const generateHorarios = () => {
    const horarios: ExamenHorarioFormData[] = [];

    // Generar combinaciones de días y horas seleccionados
    selectedDias.forEach(diaKey => {
      const dia = diasSemana.find(d => d.key === diaKey)?.label || diaKey;
      selectedHoras.forEach(hora => {
        horarios.push({
          dia,
          hora,
          publicado: true
        });
      });
    });

    // Agregar horarios personalizados
    horariosPersonalizados.forEach(horario => {
      horarios.push({
        dia: horario.dia,
        hora: horario.hora,
        publicado: horario.publicado
      });
    });

    onHorariosChange(horarios);
  };

  useEffect(() => {
    generateHorarios();
  }, [selectedDias, selectedHoras, horariosPersonalizados]);

  const handleDiaToggle = (diaKey: string) => {
    setSelectedDias(prev => 
      prev.includes(diaKey) 
        ? prev.filter(d => d !== diaKey)
        : [...prev, diaKey]
    );
  };

  const handleHoraToggle = (hora: string) => {
    setSelectedHoras(prev => 
      prev.includes(hora) 
        ? prev.filter(h => h !== hora)
        : [...prev, hora]
    );
  };

  const agregarHorarioPersonalizado = () => {
    if (nuevoHorario.dia && nuevoHorario.hora) {
      setHorariosPersonalizados(prev => [...prev, {
        ...nuevoHorario,
        publicado: true
      }]);
      setNuevoHorario({ dia: '', hora: '' });
    }
  };

  const eliminarHorarioPersonalizado = (index: number) => {
    setHorariosPersonalizados(prev => prev.filter((_, i) => i !== index));
  };

  const togglePublicadoPersonalizado = (index: number) => {
    setHorariosPersonalizados(prev => prev.map((horario, i) => 
      i === index ? { ...horario, publicado: !horario.publicado } : horario
    ));
  };

  // Función para establecer horarios rápidos
  const setHorarioRapido = (tipo: 'laboral' | 'completo' | 'sabado') => {
    switch (tipo) {
      case 'laboral':
        setSelectedDias(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']);
        setSelectedHoras(['9:30', '12:30', '15:30']);
        break;
      case 'completo':
        setSelectedDias(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']);
        setSelectedHoras(['9:30', 'finde', '15:30']);
        break;
      case 'sabado':
        setSelectedDias(['sábado']);
        setSelectedHoras(['9:30']);
        break;
    }
  };

  const limpiarTodo = () => {
    setSelectedDias([]);
    setSelectedHoras([]);
    setHorariosPersonalizados([]);
  };

  const totalHorarios = selectedDias.length * selectedHoras.length + horariosPersonalizados.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horarios de Examen
              {totalHorarios > 0 && (
                <Badge variant="secondary">{totalHorarios} horarios</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona días y horarios, o agrega horarios personalizados
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Botones de configuración rápida */}
        <div className="flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setHorarioRapido('laboral')}
          >
            Lun-Vie (9:30, 12:30, 15:30)
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setHorarioRapido('completo')}
          >
            Lun-Sáb (completo)
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setHorarioRapido('sabado')}
          >
            Solo Sábados
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={limpiarTodo}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>

        {/* Selección de días */}
        <div>
          <Label className="text-base font-medium mb-3 block">Días de la semana</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {diasSemana.map(dia => (
              <button
                key={dia.key}
                type="button"
                onClick={() => handleDiaToggle(dia.key)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedDias.includes(dia.key)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedDias.includes(dia.key) && (
                  <Check className="h-4 w-4 mx-auto mb-1" />
                )}
                {dia.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selección de horarios */}
        <div>
          <Label className="text-base font-medium mb-3 block">Horarios estándar</Label>
          <div className="flex flex-wrap gap-2">
            {horariosStandard.map(hora => (
              <button
                key={hora}
                type="button"
                onClick={() => handleHoraToggle(hora)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedHoras.includes(hora)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedHoras.includes(hora) && (
                  <Check className="h-4 w-4" />
                )}
                <Clock className="h-4 w-4" />
                {hora}
              </button>
            ))}
          </div>
        </div>

        {/* Vista previa de horarios generados */}
        {totalHorarios > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <Label className="text-base font-medium mb-3 block">
              Vista previa ({totalHorarios} horarios)
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedDias.map(diaKey => {
                const dia = diasSemana.find(d => d.key === diaKey)?.label || diaKey;
                return selectedHoras.map(hora => (
                  <div key={`${dia}-${hora}`} className="text-sm bg-white px-3 py-2 rounded border">
                    <span className="font-medium">{dia}</span> - <span className="text-gray-600">{hora}</span>
                  </div>
                ));
              })}
              {horariosPersonalizados.map((horario, index) => (
                <div key={index} className="text-sm bg-white px-3 py-2 rounded border flex items-center justify-between">
                  <span>
                    <span className="font-medium">{horario.dia}</span> - <span className="text-gray-600">{horario.hora}</span>
                    {!horario.publicado && <span className="text-red-500 ml-2">(No publicado)</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={horario.publicado}
                      onCheckedChange={() => togglePublicadoPersonalizado(index)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarHorarioPersonalizado(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar horario personalizado */}
        <div className="border-t pt-4">
          <Label className="text-base font-medium mb-3 block">Agregar horario personalizado</Label>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-dia" className="text-sm">Día</Label>
              <Input
                id="custom-dia"
                value={nuevoHorario.dia}
                onChange={(e) => setNuevoHorario(prev => ({ ...prev, dia: e.target.value }))}
                placeholder="ej: Domingo especial"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="custom-hora" className="text-sm">Hora</Label>
              <Input
                id="custom-hora"
                value={nuevoHorario.hora}
                onChange={(e) => setNuevoHorario(prev => ({ ...prev, hora: e.target.value }))}
                placeholder="ej: 10:00"
              />
            </div>
            <Button
              type="button"
              onClick={agregarHorarioPersonalizado}
              disabled={!nuevoHorario.dia || !nuevoHorario.hora}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Estado sin horarios */}
        {totalHorarios === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-500 mb-4">
              Selecciona días y horarios arriba, o usa los botones de configuración rápida
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default HorariosImprovedSection;