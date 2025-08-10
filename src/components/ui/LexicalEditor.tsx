// src/components/ui/LexicalEditor.tsx - ARREGLADO - Sin bucles infinitos
import { $getRoot, $getSelection, FORMAT_TEXT_COMMAND, $createTextNode } from 'lexical';
import { useEffect, useCallback, useState, useRef } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';

// Importar los componentes de imagen y audio
import { ImageNode } from './LexicalImageNode';
import { ImagePlugin, useImageUpload } from './LexicalImagePlugin';
import { AudioNode } from './LexicalAudioNode';
import { AudioPlugin, useAudioUpload } from './LexicalAudioPlugin';

import { Button } from './button';
import { Textarea } from './textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1,
  Heading2,
  Type,
  Eraser,
  Link as LinkIcon,
  Code,
  Eye,
  Image as ImageIcon,
  Upload,
  Music
} from 'lucide-react';

const theme = {
  // Párrafos
  paragraph: 'mb-4 text-text leading-relaxed',
  
  // Headings
  heading: {
    h1: 'text-4xl md:text-5xl lg:text-6xl text-primary font-medium mb-4 leading-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl text-primary mb-4 leading-tight',
    h3: 'text-2xl md:text-3xl text-primary font-semibold mb-3 mt-4 leading-tight',
    h4: 'text-xl md:text-2xl text-primary font-semibold mb-2 mt-3',
    h5: 'text-lg md:text-xl text-primary font-semibold mb-2 mt-3',
    h6: 'text-base md:text-lg text-primary font-semibold mb-2 mt-2',
  },
  
  // Listas
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-6 mb-4 space-y-1',
    ul: 'list-disc ml-6 mb-4 space-y-1',
    listitem: 'text-text leading-relaxed',
  },
  
  // Texto con formato
  text: {
    bold: 'font-bold text-text',
    italic: 'italic',
    underline: 'underline',
  },
  
  // Enlaces
  link: 'text-primary underline hover:text-primary-dark transition-colors duration-200',
  
  // Código
  code: 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono',
  
  // Citas
  quote: 'border-l-4 border-primary pl-4 italic text-text-muted mb-4',
  
  // Imágenes y audio
  image: 'my-4',
  audio: 'my-4',
};

interface LexicalEditorProps {
  content: string | undefined;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  maxHeight?: string;
}

// Plugin para manejar el contenido inicial - ARREGLADO
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);
  const lastContentRef = useRef<string>('');

  useEffect(() => {
    // Solo ejecutar si:
    // 1. No se ha inicializado antes
    // 2. El contenido es diferente al último procesado
    // 3. Hay contenido válido
    if (!hasInitialized.current && content && content.trim() && content !== lastContentRef.current) {
      hasInitialized.current = true;
      lastContentRef.current = content;

      // Usar un timeout para asegurar que el editor esté completamente listo
      const timeoutId = setTimeout(() => {
        editor.update(() => {
          try {
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            
            // Solo limpiar y rellenar si hay nodos válidos
            if (nodes.length > 0) {
              root.clear();
              root.append(...nodes);
            }
          } catch (error) {
            console.warn('Error parsing initial content:', error);
          }
        });
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [editor]); // Solo depende del editor, no del content

  // Resetear inicialización si el editor cambia (nueva instancia)
  useEffect(() => {
    hasInitialized.current = false;
    lastContentRef.current = '';
  }, [editor]);

  return null;
}

// Plugin para detectar cambios - MEJORADO con mejor debounce
function OnChangeContentPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        // Evitar bucles durante actualizaciones programáticas
        if (isUpdatingRef.current) {
          return;
        }

        // Limpiar timeout anterior
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Crear nuevo timeout para debounce
        debounceRef.current = setTimeout(() => {
          editorState.read(() => {
            try {
              const html = $generateHtmlFromNodes(editor, null);
              onChange(html);
            } catch (error) {
              console.warn('Error generating HTML:', error);
            }
          });
        }, 500); // Aumentar debounce a 500ms para mejor estabilidad
      }}
    />
  );
}

// Toolbar Component - SIN CAMBIOS, pero con mejor manejo de eventos
function ToolbarPlugin({ 
  isCodeView, 
  setIsCodeView, 
  htmlContent, 
  setHtmlContent 
}: {
  isCodeView: boolean;
  setIsCodeView: (value: boolean) => void;
  htmlContent: string;
  setHtmlContent: (value: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { handleFileInput: handleImageInput, handleFileChange: handleImageChange, fileInputRef: imageInputRef } = useImageUpload();
  const { handleFileInput: handleAudioInput, handleFileChange: handleAudioChange, fileInputRef: audioInputRef } = useAudioUpload();
  const [uploading, setUploading] = useState(false);
  const isUpdatingRef = useRef(false);

  const formatText = useCallback((format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    editor.focus();
  }, [editor]);

  const formatHeading = useCallback((headingSize: 'h1' | 'h2') => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
    editor.focus();
  }, [editor]);

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
    editor.focus();
  }, [editor]);

  const formatBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    editor.focus();
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    editor.focus();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        const textContent = selection.getTextContent();
        const nodes = selection.getNodes();
        
        if (nodes.length > 0) {
          for (const node of nodes) {
            node.remove();
          }
          
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(textContent);
          paragraph.append(textNode);
          selection.insertNodes([paragraph]);
        }
      }
    });
    editor.focus();
  }, [editor]);

  const insertLink = useCallback(() => {
    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
    editor.focus();
  }, [editor]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    
    try {
      await handleImageChange(event);
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert(`Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
      editor.focus();
    }
  }, [handleImageChange, editor]);

  const handleAudioUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    
    try {
      await handleAudioChange(event);
    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      alert(`Error subiendo audio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
      editor.focus();
    }
  }, [handleAudioChange, editor]);

  const toggleCodeView = useCallback(() => {
    if (!isCodeView) {
      // Cambiar a vista de código
      editor.getEditorState().read(() => {
        try {
          const html = $generateHtmlFromNodes(editor, null);
          setHtmlContent(html);
        } catch (error) {
          console.warn('Error generating HTML for code view:', error);
          setHtmlContent('');
        }
      });
      setIsCodeView(true);
    } else {
      // Cambiar a vista visual
      if (htmlContent.trim()) {
        isUpdatingRef.current = true; // Prevenir bucles
        
        editor.update(() => {
          try {
            const parser = new DOMParser();
            const dom = parser.parseFromString(htmlContent, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            root.append(...nodes);
          } catch (error) {
            console.warn('Error parsing HTML from code view:', error);
          }
        });

        // Resetear flag después de un tiempo
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
      setIsCodeView(false);
      setTimeout(() => editor.focus(), 150);
    }
  }, [editor, isCodeView, htmlContent, setIsCodeView, setHtmlContent]);

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
      {/* Input oculto para imágenes */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Input oculto para audios */}
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        style={{ display: 'none' }}
      />

      {/* Formato de texto */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('bold')}
          className="h-8 w-8 p-0"
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('italic')}
          className="h-8 w-8 p-0"
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('underline')}
          className="h-8 w-8 p-0"
          title="Subrayado (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Títulos */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={formatParagraph}
          className="h-8 w-8 p-0"
          title="Párrafo normal"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatHeading('h1')}
          className="h-8 w-8 p-0"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatHeading('h2')}
          className="h-8 w-8 p-0"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Listas */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={formatBulletList}
          className="h-8 w-8 p-0"
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={formatNumberedList}
          className="h-8 w-8 p-0"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Herramientas */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearFormatting}
          className="h-8 w-8 p-0"
          title="Limpiar formato"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          className="h-8 w-8 p-0"
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleImageInput}
          disabled={uploading}
          className="h-8 w-8 p-0"
          title="Insertar imagen"
        >
          {uploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAudioInput}
          disabled={uploading}
          className="h-8 w-8 p-0"
          title="Insertar audio"
        >
          {uploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <Music className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Vista de código */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={isCodeView ? 'default' : 'ghost'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleCodeView}
          className="h-8 px-2 text-xs"
          title="Ver/editar código HTML"
        >
          {isCodeView ? <Eye className="h-3 w-3 mr-1" /> : <Code className="h-3 w-3 mr-1" />}
          {isCodeView ? 'Visual' : 'HTML'}
        </Button>
      </div>
    </div>
  );
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe aquí...',
  label,
  className = '',
  maxHeight = '400px'
}) => {
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const editorKey = useRef(Math.random()); // Key único para forzar re-render cuando sea necesario

  // Configuración inicial con todos los nodos
  const initialConfig = {
    namespace: 'MinimalEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      ImageNode,
      AudioNode,
    ],
  };

  return (
    <div className={`lexical-editor-container ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <LexicalComposer key={editorKey.current} initialConfig={initialConfig}>
          {/* Toolbar */}
          <ToolbarPlugin 
            isCodeView={isCodeView} 
            setIsCodeView={setIsCodeView}
            htmlContent={htmlContent}
            setHtmlContent={setHtmlContent}
          />
          
          {/* Editor - Solo visible en modo visual */}
          {!isCodeView && (
            <div 
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              <RichTextPlugin
                contentEditable={
                  <ContentEditable 
                    className="min-h-[200px] p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none" 
                  />
                }
                placeholder={
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                    {placeholder}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          )}
          
          {/* Plugins esenciales */}
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagePlugin />
          <AudioPlugin />
          <OnChangeContentPlugin onChange={onChange} />
          <InitialContentPlugin content={content || ''} />
        </LexicalComposer>

        {/* Vista de código HTML */}
        {isCodeView && (
          <div 
            className="p-4 bg-gray-100 overflow-y-auto"
            style={{ maxHeight }}
          >
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Edita el código HTML aquí..."
              className="font-mono text-sm min-h-[200px] resize-none w-full"
              rows={8}
            />
            <div className="mt-2 text-xs text-gray-600">
              Presiona "Visual" para aplicar los cambios
            </div>
          </div>
        )}
      </div>
    </div>
  );
};