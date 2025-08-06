// src/components/ui/LexicalAudioNode.tsx - Nodo para archivos de audio
import React, { useCallback, useState, useEffect } from 'react';
import { 
  type NodeKey, 
  DecoratorNode, 
  type LexicalNode, 
  type DOMExportOutput, 
  type DOMConversionMap,
  type DOMConversionOutput,
  type EditorConfig,
  type SerializedLexicalNode,
  type Spread,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  $createNodeSelection,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_HIGH
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { Play, Pause, Volume2, Download } from 'lucide-react';

export interface AudioPayload {
  src: string;
  title?: string;
  key?: NodeKey;
}

function convertAudioElement(domNode: Node): null | DOMConversionOutput {
  console.log('🔄 Convirtiendo elemento de audio DOM:', domNode);
  if (domNode instanceof HTMLAudioElement) {
    const { src } = domNode;
    const title = domNode.getAttribute('data-title') || 'Audio';
    const node = $createAudioNode({ src, title });
    console.log('✅ Nodo de audio creado desde DOM:', { src, title });
    return { node };
  }
  return null;
}

export type SerializedAudioNode = Spread<
  {
    src: string;
    title: string;
  },
  SerializedLexicalNode
>;

// Componente React para el reproductor de audio
function AudioComponent({
  src,
  title,
  nodeKey,
  isSelected,
}: {
  src: string;
  title: string;
  nodeKey: NodeKey;
  isSelected: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const onClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Evitar interferencia con controles de audio
    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        const nodeSelection = $createNodeSelection();
        nodeSelection.add(nodeKey);
        $setSelection(nodeSelection);
      }
    });
  }, [editor, nodeKey]);

const onDelete = useCallback(async () => {
  // Primero eliminar del storage
  try {
    // Importar StorageService en la parte superior del archivo
    const { StorageService } = await import('../../services/storageService');
    
    console.log('🗑️ Eliminando audio del storage:', src);
    await StorageService.deleteFileByUrl(src);
  } catch (error) {
    console.warn('No se pudo eliminar audio del storage:', error);
  }
  
  // Luego eliminar del editor
  editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    if (node) {
      node.remove();
    }
  });
}, [editor, nodeKey, src]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'audio';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src, title]);

  return (
    <div 
      className={`relative bg-gray-50 border rounded-lg p-4 my-4 max-w-md cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          console.error('❌ Error cargando audio:', src);
          setLoadError(true);
        }}
        preload="metadata"
      />

      {loadError ? (
        <div className="text-center py-4">
          <div className="text-red-500 text-sm mb-2">
            ❌ Error cargando audio
          </div>
          <div className="text-xs text-gray-400">
            {src}
          </div>
        </div>
      ) : (
        <>
          {/* Header con título y botón de descarga */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800 truncate">
                {title}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadAudio();
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title="Descargar audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-3">
            {/* Botón play/pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              disabled={loadError}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            {/* Barra de progreso */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()} // Evitar seleccionar nodo al usar slider
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                    duration ? (currentTime / duration) * 100 : 0
                  }%, #E5E7EB ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB 100%)`
                }}
              />
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </>
      )}
      
      {/* Botón de eliminar cuando está seleccionado */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
          title="Eliminar audio"
        >
          ×
        </button>
      )}
    </div>
  );
}

// Componente wrapper que maneja la selección
function AudioNodeWrapper({ 
  src, 
  title, 
  nodeKey 
}: { 
  src: string; 
  title: string; 
  nodeKey: NodeKey; 
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(false);
  
  useEffect(() => {
    return mergeRegister(
      // Manejar eliminación con DELETE
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes();
            const audioNode = nodes.find(node => node.getKey() === nodeKey);
            if (audioNode) {
              audioNode.remove();
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      
      // Manejar eliminación con BACKSPACE
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes();
            const audioNode = nodes.find(node => node.getKey() === nodeKey);
            if (audioNode) {
              audioNode.remove();
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      
      // Manejar cambios de selección
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isNodeSelection(selection)) {
            const hasNodeSelected = selection.has(nodeKey);
            setIsSelected(hasNodeSelected);
          } else {
            setIsSelected(false);
          }
        });
      })
    );
  }, [editor, nodeKey]);

  return (
    <AudioComponent
      src={src}
      title={title}
      nodeKey={nodeKey}
      isSelected={isSelected}
    />
  );
}

export class AudioNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __title: string;

  static getType(): string {
    return 'custom-audio';
  }

  static clone(node: AudioNode): AudioNode {
    console.log('📋 Clonando AudioNode:', node);
    return new AudioNode(
      node.__src,
      node.__title,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    console.log('📥 Importando AudioNode desde JSON:', serializedNode);
    const { src, title } = serializedNode;
    const node = $createAudioNode({ src, title });
    return node;
  }

  exportDOM(): DOMExportOutput {
    console.log('📤 Exportando AudioNode a DOM');
    const element = document.createElement('audio');
    element.setAttribute('src', this.__src);
    element.setAttribute('controls', 'true');
    element.setAttribute('data-title', this.__title);
    element.style.width = '100%';
    element.style.margin = '1rem 0';
    return { element };
  }

  exportJSON(): SerializedAudioNode {
    console.log('📤 Exportando AudioNode a JSON');
    return {
      src: this.getSrc(),
      title: this.getTitle(),
      type: 'custom-audio',
      version: 1,
    };
  }

  constructor(src: string, title: string, key?: NodeKey) {
    super(key);
    console.log('🏗️ Creando nuevo AudioNode:', { src, title, key });
    this.__src = src;
    this.__title = title;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    console.log('🏗️ Creando DOM para AudioNode');
    const div = document.createElement('div');
    div.style.display = 'block';
    div.style.margin = '1rem 0';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getTitle(): string {
    return this.__title;
  }

  setTitle(title: string): void {
    const writable = this.getWritable();
    writable.__title = title;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  getTextContent(): string {
    return this.__title;
  }

  // Hacer el nodo seleccionable
  isIsolated(): boolean {
    return true;
  }

  // Permitir que el nodo sea eliminado
  isKeyboardSelectable(): boolean {
    return true;
  }

  decorate(): React.ReactElement {
    console.log('🎨 Renderizando AudioNode:', { src: this.__src, title: this.__title });
    
    const src = this.__src;
    const title = this.__title;
    const nodeKey = this.__key!;

    return React.createElement(AudioNodeWrapper, {
      src,
      title,
      nodeKey,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      audio: () => ({
        conversion: convertAudioElement,
        priority: 0,
      }),
    };
  }
}

export function $createAudioNode({
  src,
  title = 'Audio',
  key,
}: AudioPayload): AudioNode {
  console.log('🏭 Factory: Creando AudioNode con:', { src, title, key });
  const node = new AudioNode(src, title, key);
  console.log('✅ AudioNode creado:', node);
  return node;
}

export function $isAudioNode(
  node: LexicalNode | null | undefined,
): node is AudioNode {
  return node instanceof AudioNode;
}