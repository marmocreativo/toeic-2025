// src/components/ui/LexicalEditor.tsx
import { $getRoot, $getSelection } from 'lexical';
import { useEffect, useState } from 'react';

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
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $createParagraphNode, $createTextNode, $getRoot as getRoot } from 'lexical';

import { Label } from './label';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon
} from 'lucide-react';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'text-2xl font-bold my-2',
    h2: 'text-xl font-bold my-2',
    h3: 'text-lg font-bold my-2',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  quote: 'border-l-4 border-gray-400 pl-4 italic my-2',
};

interface LexicalEditorProps {
  content: string | undefined;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

// Plugin para inicializar contenido HTML
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = getRoot();
        root.clear();
        root.append(...nodes);
      });
    }
  }, [editor, content]);

  return null;
}

// Plugin para cambios
function MyOnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
      }}
    />
  );
}

// Toolbar
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand({type: 'FORMAT_TEXT_COMMAND', payload: 'bold'}, {});
  };

  const formatItalic = () => {
    editor.dispatchCommand({type: 'FORMAT_TEXT_COMMAND', payload: 'italic'}, {});
  };

  const formatUnderline = () => {
    editor.dispatchCommand({type: 'FORMAT_TEXT_COMMAND', payload: 'underline'}, {});
  };

  return (
    <div className="border-b border-gray-200 p-2 bg-gray-50 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={formatBold}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={formatItalic}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={formatUnderline}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300"></div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            editor.dispatchCommand({type: 'INSERT_UNORDERED_LIST_COMMAND'}, {});
          }}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            editor.dispatchCommand({type: 'INSERT_ORDERED_LIST_COMMAND'}, {});
          }}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
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
  className = ''
}) => {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode
    ],
  };

  return (
    <div className={`lexical-editor-container ${className}`}>
      {label && <Label className="block mb-2">{label}</Label>}
      
      <div className="border border-gray-300 rounded-lg overflow-hidden relative">
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="editor-container relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="editor-input min-h-[200px] p-4 outline-none focus:ring-0 prose max-w-none" 
                />
              }
              placeholder={
                <div className="editor-placeholder absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <MyOnChangePlugin onChange={onChange} />
            <ListPlugin />
            <LinkPlugin />
            <InitialContentPlugin content={content || ''} />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};