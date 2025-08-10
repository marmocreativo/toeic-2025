// src/components/admin/MuestrasSection.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { LexicalEditor } from '../ui/LexicalEditor';
import { 
  Plus, 
  Trash2, 
  ArrowUpDown,
  Check,
  X,
  Users,
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

import type { ExamenMuestraFormData } from '../../types/examen';

interface Props {
  muestras: ExamenMuestraFormData[];
  onChange: (muestras: ExamenMuestraFormData[]) => void;
}

export default function MuestrasSection({ muestras, onChange }: Props) {
  const [isReordering, setIsReordering] = useState(false);

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

  const addMuestra = () => {
    const newMuestra: ExamenMuestraFormData = {
      seccion: '',
      pregunta: '',
      publicado: true
    };
    onChange([...muestras, newMuestra]);
  };

  const updateMuestra = (index: number, field: string, value: any) => {
    const updatedMuestras = muestras.map((muestra, i) => 
      i === index ? { ...muestra, [field]: value } : muestra
    );
    onChange(updatedMuestras);
  };

  const removeMuestra = (index: number) => {
    const updatedMuestras = muestras.filter((_, i) => i !== index);
    onChange(updatedMuestras);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedMuestras = arrayMove(muestras, oldIndex, newIndex);
      onChange(reorderedMuestras);
    }
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
            <CardTitle>Preguntas de Muestra</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Ejemplos de preguntas para que los usuarios practiquen
            </p>
          </div>
          <div className="flex gap-2">
            {muestras.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setIsReordering(true)}
                disabled={isReordering}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar
              </Button>
            )}
            {muestras.length === 0 && (
              <Button onClick={addMuestra}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Muestra
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
                <h3 className="font-medium text-blue-900">Modo Reordenar Muestras</h3>
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
                items={muestras.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {muestras.map((muestra, index) => (
                    <ReorderItem
                      key={index}
                      id={index}
                      title={muestra.seccion || 'Sin sección'}
                      subtitle={muestra.pregunta ? muestra.pregunta.substring(0, 100) + '...' : undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          /* MODO FORMULARIO */
          <>
            {muestras.length > 0 ? (
              <div className="space-y-6">
                {muestras.map((muestra, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Muestra #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={muestra.publicado}
                          onCheckedChange={(checked) => updateMuestra(index, 'publicado', checked)}
                        />
                        <Label className="text-sm">Publicado</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMuestra(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Sección</Label>
                        <Input
                          value={muestra.seccion || ''}
                          onChange={(e) => updateMuestra(index, 'seccion', e.target.value)}
                          placeholder="ej: Listening, Reading, Grammar"
                        />
                      </div>

                      <div>
                        <Label>Pregunta de Muestra</Label>
                        <LexicalEditor
                          content={muestra.pregunta || ''}
                          onChange={(content) => updateMuestra(index, 'pregunta', content)}
                          placeholder="Escribe aquí la pregunta de ejemplo con sus opciones..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botón "Agregar más" al final de la lista */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                  <Button onClick={addMuestra} variant="ghost" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar otra Muestra
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay muestras</h3>
                <p className="text-gray-500 mb-4">Agrega preguntas de ejemplo para que los usuarios puedan practicar</p>
                <Button onClick={addMuestra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Muestra
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}