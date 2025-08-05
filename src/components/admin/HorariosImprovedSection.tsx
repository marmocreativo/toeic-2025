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
  X,
  Edit3,
  Save,
  RotateCcw
} from 'lucide-react';

// Definir tipos para el horario individual editable
interface HorarioEditable extends ExamenHorarioFormData {
  id: string; // ID temporal para manejo local
  isEditing?: boolean;
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

  // Estados para generación rápida
  const [selectedDias, setSelectedDias] = useState<string[]>([]);
  const [selectedHoras, setSelectedHoras] = useState<string[]>([]);
  
  // Estado principal: lista de horarios editables
  const [horariosEditables, setHorariosEditables] = useState<HorarioEditable[]>([]);
  
  // Estados para horario personalizado
  const [nuevoHorario, setNuevoHorario] = useState({ dia: '', hora: '' });

  // Generar ID único para horarios
  const generateId = () => `horario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Inicializar desde formData existente
  useEffect(() => {
    if (formData.horarios && formData.horarios.length > 0) {
      const horariosConId = formData.horarios.map(horario => ({
        ...horario,
        id: generateId(),
        isEditing: false
      }));
      setHorariosEditables(horariosConId);
    }
  }, []);

  // Actualizar formData cuando cambian los horarios editables
  useEffect(() => {
    const horariosParaFormulario = horariosEditables.map(({ id, isEditing, ...horario }) => horario);
    onHorariosChange(horariosParaFormulario);
  }, [horariosEditables]);

  // Generar combinaciones desde selección rápida
  const generarCombinaciones = () => {
    const nuevasCombinaciones: HorarioEditable[] = [];

    selectedDias.forEach(diaKey => {
      const dia = diasSemana.find(d => d.key === diaKey)?.label || diaKey;
      selectedHoras.forEach(hora => {
        // Verificar si ya existe esta combinación
        const yaExiste = horariosEditables.some(h => 
          h.dia === dia && h.hora === hora
        );
        
        if (!yaExiste) {
          nuevasCombinaciones.push({
            id: generateId(),
            dia,
            hora,
            publicado: true,
            isEditing: false
          });
        }
      });
    });

    if (nuevasCombinaciones.length > 0) {
      setHorariosEditables(prev => [...prev, ...nuevasCombinaciones]);
      
      // Limpiar selecciones después de generar
      setSelectedDias([]);
      setSelectedHoras([]);
    }
  };

  // Manejar selección de días
  const handleDiaToggle = (diaKey: string) => {
    setSelectedDias(prev => 
      prev.includes(diaKey) 
        ? prev.filter(d => d !== diaKey)
        : [...prev, diaKey]
    );
  };

  // Manejar selección de horas
  const handleHoraToggle = (hora: string) => {
    setSelectedHoras(prev => 
      prev.includes(hora) 
        ? prev.filter(h => h !== hora)
        : [...prev, hora]
    );
  };

  // Agregar horario personalizado
  const agregarHorarioPersonalizado = () => {
    if (nuevoHorario.dia && nuevoHorario.hora) {
      // Verificar si ya existe
      const yaExiste = horariosEditables.some(h => 
        h.dia === nuevoHorario.dia && h.hora === nuevoHorario.hora
      );

      if (!yaExiste) {
        const nuevoHorarioEditable: HorarioEditable = {
          id: generateId(),
          dia: nuevoHorario.dia,
          hora: nuevoHorario.hora,
          publicado: true,
          isEditing: false
        };

        setHorariosEditables(prev => [...prev, nuevoHorarioEditable]);
        setNuevoHorario({ dia: '', hora: '' });
      }
    }
  };

  // Eliminar horario específico
  const eliminarHorario = (id: string) => {
    setHorariosEditables(prev => prev.filter(h => h.id !== id));
  };

  // Toggle publicado
  const togglePublicado = (id: string) => {
    setHorariosEditables(prev => prev.map(horario => 
      horario.id === id 
        ? { ...horario, publicado: !horario.publicado }
        : horario
    ));
  };

  // Iniciar edición
  const iniciarEdicion = (id: string) => {
    setHorariosEditables(prev => prev.map(horario => 
      horario.id === id 
        ? { ...horario, isEditing: true }
        : { ...horario, isEditing: false } // Solo uno en edición a la vez
    ));
  };

  // Guardar edición
  const guardarEdicion = (id: string) => {
    setHorariosEditables(prev => prev.map(horario => 
      horario.id === id 
        ? { ...horario, isEditing: false }
        : horario
    ));
  };

  // Cancelar edición
  const cancelarEdicion = (id: string) => {
    setHorariosEditables(prev => prev.map(horario => 
      horario.id === id 
        ? { ...horario, isEditing: false }
        : horario
    ));
  };

  // Actualizar horario en edición
  const actualizarHorarioEnEdicion = (id: string, field: 'dia' | 'hora', value: string) => {
    setHorariosEditables(prev => prev.map(horario => 
      horario.id === id 
        ? { ...horario, [field]: value }
        : horario
    ));
  };

  // Configuraciones rápidas
  const setHorarioRapido = (tipo: 'laboral' | 'completo' | 'sabado') => {
    switch (tipo) {
      case 'laboral':
        setSelectedDias(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']);
        setSelectedHoras(['9:30', '12:30', '15:30']);
        break;
      case 'completo':
        setSelectedDias(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']);
        setSelectedHoras(['9:30', '12:30', '15:30']);
        break;
      case 'sabado':
        setSelectedDias(['sábado']);
        setSelectedHoras(['9:30']);
        break;
    }
  };

  // Limpiar todo
  const limpiarTodo = () => {
    setSelectedDias([]);
    setSelectedHoras([]);
    setHorariosEditables([]);
  };

  const totalCombinacionesPendientes = selectedDias.length * selectedHoras.length;
  const totalHorarios = horariosEditables.length;

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
              Genera combinaciones rápidas o agrega horarios individuales. Cada horario es completamente editable.
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
          {totalHorarios > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={limpiarTodo}
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar Todo
            </Button>
          )}
        </div>

        {/* Generador de combinaciones */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="text-base font-medium mb-3 block">Generador rápido de combinaciones</Label>
          
          {/* Selección de días */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Seleccionar días:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {diasSemana.map(dia => (
                <button
                  key={dia.key}
                  type="button"
                  onClick={() => handleDiaToggle(dia.key)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                    selectedDias.includes(dia.key)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedDias.includes(dia.key) && (
                    <Check className="h-3 w-3 mx-auto mb-1" />
                  )}
                  {dia.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selección de horarios */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Seleccionar horarios:</Label>
            <div className="flex flex-wrap gap-2">
              {horariosStandard.map(hora => (
                <button
                  key={hora}
                  type="button"
                  onClick={() => handleHoraToggle(hora)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedHoras.includes(hora)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedHoras.includes(hora) && (
                    <Check className="h-3 w-3" />
                  )}
                  <Clock className="h-3 w-3" />
                  {hora}
                </button>
              ))}
            </div>
          </div>

          {/* Botón generar */}
          {totalCombinacionesPendientes > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Se generarán <strong>{totalCombinacionesPendientes} combinaciones</strong>
              </p>
              <Button
                type="button"
                onClick={generarCombinaciones}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Generar Combinaciones
              </Button>
            </div>
          )}
        </div>

        {/* Lista de horarios editables */}
        {totalHorarios > 0 && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              Horarios configurados ({totalHorarios})
            </Label>
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
              {horariosEditables.map((horario) => (
                <div 
                  key={horario.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    horario.isEditing 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {horario.isEditing ? (
                    /* Modo edición */
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={horario.dia || ''}
                        onChange={(e) => actualizarHorarioEnEdicion(horario.id, 'dia', e.target.value)}
                        placeholder="Día"
                        className="w-32"
                      />
                      <span className="text-gray-400">-</span>
                      <Input
                        value={horario.hora || ''}
                        onChange={(e) => actualizarHorarioEnEdicion(horario.id, 'hora', e.target.value)}
                        placeholder="Hora"
                        className="w-24"
                      />
                      <div className="flex items-center gap-1 ml-auto">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => guardarEdicion(horario.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelarEdicion(horario.id)}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Modo vista */
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          <span className="font-medium text-gray-900">{horario.dia}</span>
                          <span className="text-gray-400 mx-2">-</span>
                          <span className="text-gray-600">{horario.hora}</span>
                        </div>
                        {!horario.publicado && (
                          <Badge variant="secondary" className="text-xs">
                            No publicado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={horario.publicado || false}
                          onCheckedChange={() => togglePublicado(horario.id)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => iniciarEdicion(horario.id)}
                          className="h-8 w-8 p-0"
                          title="Editar horario"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarHorario(horario.id)}
                          className="h-8 w-8 p-0"
                          title="Eliminar horario"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar horario personalizado */}
        <div className="border-t pt-4">
          <Label className="text-base font-medium mb-3 block">Agregar horario individual</Label>
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

        {/* Estado vacío */}
        {totalHorarios === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-500 mb-4">
              Usa el generador rápido arriba o agrega horarios individuales
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default HorariosImprovedSection;