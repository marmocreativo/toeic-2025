// src/components/ui/SimpleHtmlEditor.tsx - Versión alternativa
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Textarea } from './textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Eye, 
  Code,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Quote
} from 'lucide-react';

interface SimpleHtmlEditorProps {
  content: string | undefined;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}



export const SimpleHtmlEditor: React.FC<SimpleHtmlEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe aquí...',
  label,
  className = ''
}) => {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [localContent, setLocalContent] = useState(content || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  // Efectos para el editor
  useEffect(() => {
  const handleSelectionChange = () => {
    
    if (!editorRef.current || mode !== 'visual') return;
    const formats: string[] = [];

    const getState = (command: string) => document.queryCommandState(command);

    if (getState('bold')) formats.push('bold');
    if (getState('italic')) formats.push('italic');
    if (getState('underline')) formats.push('underline');
    if (getState('insertUnorderedList')) formats.push('ul');
    if (getState('insertOrderedList')) formats.push('ol');

    if (document.queryCommandValue('formatBlock') === 'h1') formats.push('h1');
    if (document.queryCommandValue('formatBlock') === 'h2') formats.push('h2');
    if (document.queryCommandValue('formatBlock') === 'blockquote') formats.push('blockquote');

    setActiveFormats(formats);
  };

  document.addEventListener('selectionchange', handleSelectionChange);
  return () => document.removeEventListener('selectionchange', handleSelectionChange);
}, [mode]);

  useEffect(() => {
  if (editorRef.current && mode === 'visual') {
    editorRef.current.innerHTML = localContent;
  }
}, [mode, localContent]); // Solo cuando cambia de code -> visual

useEffect(() => {
  if (editorRef.current && content !== localContent && !isUpdatingRef.current) {
    setLocalContent(content || '');
  }
}, [content, localContent]);

  // Sincronizar contenido externo con estado local
  useEffect(() => {
    if (!isUpdatingRef.current && content !== localContent) {
      setLocalContent(content || '');
    }
  }, [content, localContent]);

const updateContent = useCallback((newContent: string) => {
  isUpdatingRef.current = true;
  setLocalContent(newContent);
  onChange(newContent);
  setTimeout(() => {
    isUpdatingRef.current = false;
  }, 100);
}, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      
      // Actualizar después de un breve delay
      setTimeout(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setLocalContent(html);
            onChange(html);
        }
        }, 0);
    }
  }, [updateContent]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    updateContent(target.innerHTML);
  }, [updateContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // No interferir con Enter, dejar comportamiento natural
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
  }, []);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  }, [updateContent]);

  const insertLink = useCallback(() => {
    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const formatHeading = useCallback((level: number) => {
    execCommand('formatBlock', `h${level}`);
  }, [execCommand]);

  const formatQuote = useCallback(() => {
    execCommand('formatBlock', 'blockquote');
  }, [execCommand]);

  return (
    <div className={`simple-html-editor ${className}`}>
      {label && <Label className="block mb-2">{label}</Label>}
      
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
          {/* Formato de texto */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('bold') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('bold')}
              className="h-8 w-8 p-0"
              title="Negrita (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('italic') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('italic')}
              className="h-8 w-8 p-0"
              title="Cursiva (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('underline') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('underline')}
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
              variant={activeFormats.includes('h1') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatHeading(1)}
              className="h-8 w-8 p-0"
              title="Título 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('h2') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatHeading(2)}
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
              variant={activeFormats.includes('insertUnorderedList') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('insertUnorderedList')}
              className="h-8 w-8 p-0"
              title="Lista con viñetas"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('insertOrderedList') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('insertOrderedList')}
              className="h-8 w-8 p-0"
              title="Lista numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Otros formatos */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={activeFormats.includes('blockquote') ? 'default' : 'ghost'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={formatQuote}
              className="h-8 w-8 p-0"
              title="Cita"
            >
              <Quote className="h-4 w-4" />
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
          </div>

          <div className="flex-1"></div>

          {/* Toggle modo */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={mode === 'visual' ? 'default' : 'ghost'}
              onClick={() => setMode('visual')}
              className="h-8 px-2 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Visual
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'code' ? 'default' : 'ghost'}
              onClick={() => setMode('code')}
              className="h-8 px-2 text-xs"
            >
              <Code className="h-3 w-3 mr-1" />
              HTML
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative">
          {mode === 'visual' ? (
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="min-h-[200px] p-4 outline-none focus:ring-0 prose prose-sm max-w-none"
                style={{ minHeight: '200px', lineHeight: '1.6' }}
                suppressContentEditableWarning={true}
            />
          ) : (
            <Textarea
              value={localContent}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              className="border-0 rounded-none min-h-[200px] font-mono text-sm resize-none focus:ring-0"
              rows={10}
            />
          )}

          {/* Placeholder cuando está vacío */}
          {mode === 'visual' && !localContent && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};