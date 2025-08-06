// src/components/ui/LexicalImageNode.tsx - Con controles mejorados y redimensionamiento
import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import { Download, RotateCw, Maximize2 } from 'lucide-react';

export interface ImagePayload {
  altText: string;
  src: string;
  width?: number;
  height?: number;
  key?: NodeKey;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  console.log('🔄 Convirtiendo elemento de imagen DOM:', domNode);
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ 
      altText, 
      src, 
      width: width || undefined, 
      height: height || undefined 
    });
    console.log('✅ Nodo creado desde DOM:', { altText, src, width, height });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

// Componente React para la imagen con controles avanzados
function ImageComponent({
  src,
  altText,
  nodeKey,
  isSelected,
  width: initialWidth,
  height: initialHeight,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  isSelected: boolean;
  width?: number;
  height?: number;
}) {
  const [editor] = useLexicalComposerContext();
  const [loadError, setLoadError] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  const onClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
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
    
    console.log('🗑️ Eliminando imagen del storage:', src);
    await StorageService.deleteFileByUrl(src);
  } catch (error) {
    console.warn('No se pudo eliminar imagen del storage:', error);
  }
  
  // Luego eliminar del editor
  editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    if (node) {
      node.remove();
    }
  });
}, [editor, nodeKey, src]);

  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = altText || 'imagen';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src, altText]);

  const resetSize = useCallback(() => {
    setWidth(undefined);
    setHeight(undefined);
    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as any;
      if (node && node.setWidth && node.setHeight) {
        node.setWidth(undefined);
        node.setHeight(undefined);
      }
    });
  }, [editor, nodeKey]);

  const fitToContainer = useCallback(() => {
    const containerWidth = 600; // Ancho máximo del contenedor
    const newWidth = Math.min(naturalWidth, containerWidth);
    const newHeight = (newWidth / naturalWidth) * naturalHeight;
    
    setWidth(newWidth);
    setHeight(newHeight);
    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as any;
      if (node && node.setWidth && node.setHeight) {
        node.setWidth(newWidth);
        node.setHeight(newHeight);
      }
    });
  }, [editor, nodeKey, naturalWidth, naturalHeight]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      
      // Si no hay dimensiones establecidas, usar las naturales
      if (!width && !height) {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      }
    }
  }, [width, height]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width || naturalWidth;
    const startHeight = height || naturalHeight;
    // log para evitar el error de never read
    console.log(startHeight);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      // log para evitar el error de never read
    console.log(deltaY);
      
      const newWidth = Math.max(100, startWidth + deltaX);
      const newHeight = newWidth / aspectRatio;
      
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Actualizar el nodo con las nuevas dimensiones
      editor.update(() => {
        const node = $getNodeByKey(nodeKey) as any;
        if (node && node.setWidth && node.setHeight) {
          node.setWidth(width);
          node.setHeight(height);
        }
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editor, nodeKey, width, height, naturalWidth, naturalHeight, aspectRatio]);

  const currentWidth = width || naturalWidth || 'auto';
  const currentHeight = height || naturalHeight || 'auto';

  return (
    <div 
      className={`relative inline-block cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
      style={{ width: 'fit-content' }}
    >
      {loadError ? (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-w-[200px]">
          <div className="text-gray-500 text-sm mb-2">
            ❌ Error cargando imagen
          </div>
          <div className="text-xs text-gray-400 mt-1 break-all">
            {src}
          </div>
        </div>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={altText}
          width={currentWidth}
          height={currentHeight}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: isSelected 
              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
            display: 'block',
            transition: isResizing ? 'none' : 'box-shadow 0.2s ease',
            cursor: isSelected ? 'default' : 'pointer'
          }}
          draggable={false}
          onLoad={handleImageLoad}
          onError={() => {
            console.error('❌ Error cargando imagen:', src);
            setLoadError(true);
          }}
        />
      )}

      {/* Controles cuando está seleccionada */}
      {isSelected && !loadError && (
        <>
          {/* Botón de eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg z-10"
            title="Eliminar imagen"
          >
            ×
          </button>

          {/* Barra de controles */}
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1">
              {/* Descargar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage();
                }}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Descargar imagen"
              >
                <Download className="w-3 h-3" />
              </button>

              {/* Tamaño original */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetSize();
                }}
                className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Tamaño original"
              >
                <RotateCw className="w-3 h-3" />
              </button>

              {/* Ajustar al contenedor */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fitToContainer();
                }}
                className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Ajustar al contenedor"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              {/* Información de tamaño */}
              <div className="px-2 py-1 text-xs text-gray-500 border-l border-gray-200">
                {Math.round(currentWidth as number)}×{Math.round(currentHeight as number)}
              </div>
            </div>
          </div>

          {/* Handle de redimensionamiento */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 shadow-lg z-10"
            title="Arrastrar para redimensionar"
          />
        </>
      )}

      {/* Overlay de redimensionamiento */}
      {isResizing && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

// Componente wrapper que maneja la selección
function ImageNodeWrapper({ 
  src, 
  altText, 
  nodeKey,
  width,
  height 
}: { 
  src: string; 
  altText: string; 
  nodeKey: NodeKey;
  width?: number;
  height?: number;
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
            const imageNode = nodes.find(node => node.getKey() === nodeKey);
            if (imageNode) {
              imageNode.remove();
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
            const imageNode = nodes.find(node => node.getKey() === nodeKey);
            if (imageNode) {
              imageNode.remove();
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
    <ImageComponent
      src={src}
      altText={altText}
      nodeKey={nodeKey}
      isSelected={isSelected}
      width={width}
      height={height}
    />
  );
}

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return 'custom-image';
  }

  static clone(node: ImageNode): ImageNode {
    console.log('📋 Clonando ImageNode:', node);
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    console.log('📥 Importando ImageNode desde JSON:', serializedNode);
    const { altText, src, width, height } = serializedNode;
    const node = $createImageNode({
      altText,
      src,
      width,
      height,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    console.log('📤 Exportando ImageNode a DOM');
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    if (this.__width) element.setAttribute('width', String(this.__width));
    if (this.__height) element.setAttribute('height', String(this.__height));
    element.setAttribute('style', 'max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);');
    return { element };
  }

  exportJSON(): SerializedImageNode {
    console.log('📤 Exportando ImageNode a JSON');
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      width: this.getWidth(),
      height: this.getHeight(),
      type: 'custom-image',
      version: 1,
    };
  }

  constructor(src: string, altText: string, width?: number, height?: number, key?: NodeKey) {
    super(key);
    console.log('🏗️ Creando nuevo ImageNode:', { src, altText, width, height, key });
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    console.log('🏗️ Creando DOM para ImageNode');
    const span = document.createElement('span');
    const theme = config.theme;
    if (theme && theme.image) {
      span.className = theme.image;
    }
    span.style.display = 'block';
    span.style.margin = '1rem 0';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  getHeight(): number | undefined {
    return this.__height;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  setWidth(width?: number): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  setHeight(height?: number): void {
    const writable = this.getWritable();
    writable.__height = height;
  }

  getTextContent(): string {
    return this.__altText;
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
    console.log('🎨 Renderizando ImageNode:', { 
      src: this.__src, 
      alt: this.__altText,
      width: this.__width,
      height: this.__height
    });
    
    const src = this.__src;
    const altText = this.__altText;
    const nodeKey = this.__key!;
    const width = this.__width;
    const height = this.__height;

    return React.createElement(ImageNodeWrapper, {
      src,
      altText,
      nodeKey,
      width,
      height,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }
}

export function $createImageNode({
  altText,
  src,
  width,
  height,
  key,
}: ImagePayload): ImageNode {
  console.log('🏭 Factory: Creando ImageNode con:', { altText, src, width, height, key });
  const node = new ImageNode(src, altText, width, height, key);
  console.log('✅ ImageNode creado:', node);
  return node;
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}