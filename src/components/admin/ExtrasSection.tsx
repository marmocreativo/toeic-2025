// src/components/admin/ExtrasSection.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { LexicalEditor } from '../ui/LexicalEditor';
import { 
  Plus, 
  Trash2, 
  ArrowUpDown,
  Check,
  X,
  FileText,
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

import type { ExamenExtraFormData } from '../../types/examen';

interface Props {
  extras: ExamenExtraFormData[];
  onChange: (extras: ExamenExtraFormData[]) => void;
}

export default function ExtrasSection({ extras, onChange }: Props) {
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

  const addExtra = () => {
    const newExtra: ExamenExtraFormData = {
      titulo: '',
      contenido: '',
      boton_texto: '',
      en_titulo: '',
      en_contenido: '',
      en_boton_texto: '',
      boton_enlace: '',
      publicado: true
    };
    onChange([...extras, newExtra]);
  };

  const updateExtra = (index: number, field: string, value: any) => {
    const updatedExtras = extras.map((extra, i) => 
      i === index ? { ...extra, [field]: value } : extra
    );
    onChange(updatedExtras);
  };

  const removeExtra = (index: number) => {
    const updatedExtras = extras.filter((_, i) => i !== index);
    onChange(updatedExtras);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedExtras = arrayMove(extras, oldIndex, newIndex);
      onChange(reorderedExtras);
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
            <CardTitle>Información Extra</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Contenido adicional como consejos, recursos o material complementario
            </p>
          </div>
          <div className="flex gap-2">
            {extras.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setIsReordering(true)}
                disabled={isReordering}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar
              </Button>
            )}
            {extras.length === 0 && (
              <Button onClick={addExtra}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Extra
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
                <h3 className="font-medium text-blue-900">Modo Reordenar Extras</h3>
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
                items={extras.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {extras.map((extra, index) => (
                    <ReorderItem
                      key={index}
                      id={index}
                      title={extra.titulo || 'Sin título'}
                      subtitle={extra.en_titulo || undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          /* MODO FORMULARIO */
          <>
            {extras.length > 0 ? (
              <div className="space-y-6">
                {extras.map((extra, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Extra #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={extra.publicado}
                          onCheckedChange={(checked) => updateExtra(index, 'publicado', checked)}
                        />
                        <Label className="text-sm">Publicado</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeExtra(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="es-extra" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="es-extra">🇪🇸 Español</TabsTrigger>
                        <TabsTrigger value="en-extra">🇺🇸 English</TabsTrigger>
                      </TabsList>

                      <TabsContent value="es-extra" className="space-y-4">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={extra.titulo || ''}
                            onChange={(e) => updateExtra(index, 'titulo', e.target.value)}
                            placeholder="ej: Consejos para el examen"
                          />
                        </div>
                        <div>
                          <Label>Contenido</Label>
                          <LexicalEditor
                            content={extra.contenido || ''}
                            onChange={(content) => updateExtra(index, 'contenido', content)}
                            placeholder="Información adicional..."
                          />
                        </div>
                        <div>
                          <Label>Texto del Botón</Label>
                          <Input
                            value={extra.boton_texto || ''}
                            onChange={(e) => updateExtra(index, 'boton_texto', e.target.value)}
                            placeholder="ej: Descargar Guía"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="en-extra" className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={extra.en_titulo || ''}
                            onChange={(e) => updateExtra(index, 'en_titulo', e.target.value)}
                            placeholder="e.g: Exam Tips"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <LexicalEditor
                            content={extra.en_contenido || ''}
                            onChange={(content) => updateExtra(index, 'en_contenido', content)}
                            placeholder="Additional information..."
                          />
                        </div>
                        <div>
                          <Label>Button Text</Label>
                          <Input
                            value={extra.en_boton_texto || ''}
                            onChange={(e) => updateExtra(index, 'en_boton_texto', e.target.value)}
                            placeholder="e.g: Download Guide"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-4">
                      <Label>Enlace del Botón</Label>
                      <Input
                        value={extra.boton_enlace || ''}
                        onChange={(e) => updateExtra(index, 'boton_enlace', e.target.value)}
                        placeholder="https://ejemplo.com/recurso"
                      />
                    </div>
                  </div>
                ))}

                {/* Botón "Agregar más" al final de la lista */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                  <Button onClick={addExtra} variant="ghost" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar otro Extra
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay información extra</h3>
                <p className="text-gray-500 mb-4">Agrega contenido adicional como consejos o recursos</p>
                <Button onClick={addExtra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Extra
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}