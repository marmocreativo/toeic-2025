// src/components/admin/FaqsSection.tsx
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
  HelpCircle,
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

import type { ExamenFaqFormData } from '../../types/examen';

interface Props {
  faqs: ExamenFaqFormData[];
  onChange: (faqs: ExamenFaqFormData[]) => void;
}

export default function FaqsSection({ faqs, onChange }: Props) {
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

  const addFaq = () => {
    const newFaq: ExamenFaqFormData = {
      pregunta: '',
      respuesta: '',
      en_pregunta: '',
      en_respuesta: '',
      publicado: true
    };
    onChange([...faqs, newFaq]);
  };

  const updateFaq = (index: number, field: string, value: any) => {
    const updatedFaqs = faqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    onChange(updatedFaqs);
  };

  const removeFaq = (index: number) => {
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    onChange(updatedFaqs);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedFaqs = arrayMove(faqs, oldIndex, newIndex);
      onChange(reorderedFaqs);
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
            <CardTitle>Preguntas Frecuentes</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Responde las dudas más comunes sobre este examen
            </p>
          </div>
          <div className="flex gap-2">
            {faqs.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setIsReordering(true)}
                disabled={isReordering}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar
              </Button>
            )}
            {faqs.length === 0 && (
              <Button onClick={addFaq}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar FAQ
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
                <h3 className="font-medium text-blue-900">Modo Reordenar FAQs</h3>
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
                items={faqs.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <ReorderItem
                      key={index}
                      id={index}
                      title={faq.pregunta || 'Sin pregunta'}
                      subtitle={faq.en_pregunta || undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          /* MODO FORMULARIO */
          <>
            {faqs.length > 0 ? (
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">FAQ #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={faq.publicado}
                          onCheckedChange={(checked) => updateFaq(index, 'publicado', checked)}
                        />
                        <Label className="text-sm">Publicado</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="es-faq" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="es-faq">🇪🇸 Español</TabsTrigger>
                        <TabsTrigger value="en-faq">🇺🇸 English</TabsTrigger>
                      </TabsList>

                      <TabsContent value="es-faq" className="space-y-4">
                        <div>
                          <Label>Pregunta</Label>
                          <Input
                            value={faq.pregunta || ''}
                            onChange={(e) => updateFaq(index, 'pregunta', e.target.value)}
                            placeholder="¿Cuánto dura el examen?"
                          />
                        </div>
                        <div>
                          <Label>Respuesta</Label>
                          <LexicalEditor
                            content={faq.respuesta || ''}
                            onChange={(content) => updateFaq(index, 'respuesta', content)}
                            placeholder="El examen tiene una duración de..."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="en-faq" className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={faq.en_pregunta || ''}
                            onChange={(e) => updateFaq(index, 'en_pregunta', e.target.value)}
                            placeholder="How long is the exam?"
                          />
                        </div>
                        <div>
                          <Label>Answer</Label>
                          <LexicalEditor
                            content={faq.en_respuesta || ''}
                            onChange={(content) => updateFaq(index, 'en_respuesta', content)}
                            placeholder="The exam duration is..."
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}

                {/* Botón "Agregar más" al final de la lista */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                  <Button onClick={addFaq} variant="ghost" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar otra FAQ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay FAQs</h3>
                <p className="text-gray-500 mb-4">Agrega preguntas frecuentes para ayudar a los usuarios</p>
                <Button onClick={addFaq}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera FAQ
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}