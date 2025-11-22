// src/components/admin/FechasEspecialesSection.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { 
  Plus, 
  Trash2, 
  ArrowUpDown,
  Check,
  X,
  Calendar,
  GripVertical
} from 'lucide-react';

// Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { ExamenFechaEspecialFormData } from '../../types/examen';

interface Props {
  fechasEspeciales: ExamenFechaEspecialFormData[];
  onChange: (fechas: ExamenFechaEspecialFormData[]) => void;
}

export default function FechasEspecialesSection({ fechasEspeciales, onChange }: Props) {
  const [isReordering, setIsReordering] = useState(false);
  const [selectedFechas, setSelectedFechas] = useState<number[]>([]);

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFechaEspecial = () => {
    const newFecha: ExamenFechaEspecialFormData = {
      fecha: '',
      hora: '', // ← Cambiamos de '09:00' a vacío
      publicado: true
    };
    onChange([...fechasEspeciales, newFecha]);
  };

  const updateFechaEspecial = (index: number, field: string, value: any) => {
    const updatedFechas = fechasEspeciales.map((fecha, i) => 
      i === index ? { ...fecha, [field]: value } : fecha
    );
    onChange(updatedFechas);
  };

  const removeFechaEspecial = (index: number) => {
    const updatedFechas = fechasEspeciales.filter((_, i) => i !== index);
    onChange(updatedFechas);
    // Limpiar selecciones
    setSelectedFechas(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedFechas = arrayMove(fechasEspeciales, oldIndex, newIndex);
      onChange(reorderedFechas);
    }
  };

  // Funciones para selección múltiple
  const toggleFechaSelection = (index: number) => {
    setSelectedFechas(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleSelectAllFechas = () => {
    if (selectedFechas.length === fechasEspeciales.length) {
      setSelectedFechas([]);
    } else {
      setSelectedFechas(Array.from({ length: fechasEspeciales.length }, (_, i) => i));
    }
  };

  const removeSelectedFechas = () => {
    const updatedFechas = fechasEspeciales.filter((_, index) => 
      !selectedFechas.includes(index)
    );
    onChange(updatedFechas);
    setSelectedFechas([]);
  };

  // Componente para reordenar
  const ReorderItem = ({ 
    id, 
    title, 
    subtitle 
  }: { 
    id: number; 
    title: string; 
    subtitle?: string;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className="text-sm text-gray-400">#{id + 1}</div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fechas Especiales</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Fechas y horarios específicos para este examen (eventos únicos)
            </p>
          </div>
          <div className="flex gap-2">
            {fechasEspeciales.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setIsReordering(true)}
                disabled={isReordering}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar
              </Button>
            )}
            {fechasEspeciales.length === 0 && (
              <Button onClick={addFechaEspecial}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Fecha
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* MODO REORDENAR */}
        {isReordering ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Modo Reordenar Fechas Especiales</h3>
                <p className="text-sm text-blue-700">Arrastra los elementos para cambiar su orden</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReordering(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsReordering(false)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Orden
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fechasEspeciales.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {fechasEspeciales.map((fecha, index) => (
                    <ReorderItem
                      key={index}
                      id={index}
                      title={fecha.fecha ? new Date(fecha.fecha+ 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Sin fecha'}
                      subtitle={fecha.hora ? `${fecha.hora}` : 'Sin hora'}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          /* MODO FORMULARIO */
          <>
            {fechasEspeciales.length > 0 ? (
              <div className="space-y-6">
                {/* Header con controles de selección múltiple */}
                {fechasEspeciales.length > 1 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFechas.length === fechasEspeciales.length}
                        onChange={toggleSelectAllFechas}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">
                        {selectedFechas.length > 0 
                          ? `${selectedFechas.length} seleccionada(s)`
                          : 'Seleccionar todas'
                        }
                      </span>
                    </div>
                    {selectedFechas.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={removeSelectedFechas}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar ({selectedFechas.length})
                      </Button>
                    )}
                  </div>
                )}

                {/* Lista de fechas especiales */}
                <div className="space-y-4">
                  {fechasEspeciales.map((fecha, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {fechasEspeciales.length > 1 && (
                            <input
                              type="checkbox"
                              checked={selectedFechas.includes(index)}
                              onChange={() => toggleFechaSelection(index)}
                              className="rounded border-gray-300"
                            />
                          )}
                          <h4 className="font-medium text-gray-900">
                            Fecha Especial #{index + 1}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={fecha.publicado}
                            onCheckedChange={(checked) => updateFechaEspecial(index, 'publicado', checked)}
                          />
                          <Label className="text-sm">Publicado</Label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFechaEspecial(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha *</Label>
                          <Input
                            type="date"
                            value={fecha.fecha || ''}
                            onChange={(e) => updateFechaEspecial(index, 'fecha', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label>Hora (opcional)</Label>
                          <Input
                            type="time"
                            value={fecha.hora || ''}
                            onChange={(e) => updateFechaEspecial(index, 'hora', e.target.value)}
                            placeholder="09:00"
                          />
                        </div>
                      </div>

                      {/* Vista previa */}
                      {fecha.fecha && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <strong>Vista previa:</strong>{' '}
                          {new Date(fecha.fecha+ 'T00:00:00').toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {fecha.hora && ` a las ${fecha.hora}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botón "Agregar más" al final de la lista */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                  <Button onClick={addFechaEspecial} variant="ghost" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar otra Fecha Especial
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay fechas especiales</h3>
                <p className="text-gray-500 mb-4">
                  Agrega fechas específicas para eventos únicos del examen
                </p>
                <Button onClick={addFechaEspecial}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Fecha Especial
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}