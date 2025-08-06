// src/components/ui/LexicalAudioPlugin.tsx - Plugin para manejo de audio
import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, $getSelection, $isRangeSelection, $getRoot } from 'lexical';
import { createCommand, type LexicalCommand } from 'lexical';
import { $createAudioNode, AudioNode } from './LexicalAudioNode';
import { StorageService, STORAGE_BUCKETS } from '../../services/storageService';

// Comando para insertar audio
export const INSERT_AUDIO_COMMAND: LexicalCommand<{
  src: string;
  title: string;
}> = createCommand('INSERT_CUSTOM_AUDIO_COMMAND');

// Plugin para manejar audios
export function AudioPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log('🔧 Inicializando AudioPlugin...');
    
    if (!editor.hasNodes([AudioNode])) {
      console.error('❌ AudioNode no está registrado en el editor');
      throw new Error('AudioPlugin: AudioNode not registered on editor');
    }
    
    console.log('✅ AudioNode registrado correctamente');

    const unregister = editor.registerCommand<{
      src: string;
      title: string;
    }>(
      INSERT_AUDIO_COMMAND,
      (payload) => {
        console.log('🎵 Comando INSERT_AUDIO_COMMAND ejecutado con payload:', payload);
        
        try {
          const audioNode = $createAudioNode(payload);
          console.log('🎧 Nodo de audio creado:', audioNode);
          
          const selection = $getSelection();
          console.log('📍 Selección actual:', selection);
          
          if ($isRangeSelection(selection)) {
            console.log('✅ Insertando en selección actual');
            $insertNodes([audioNode]);
          } else {
            console.log('⚠️ No hay selección, insertando al final');
            const root = $getRoot();
            root.append(audioNode);
          }
          
          console.log('✅ Audio insertado en el editor');
          return true;
        } catch (error) {
          console.error('❌ Error en comando INSERT_AUDIO:', error);
          return false;
        }
      },
      COMMAND_PRIORITY_EDITOR,
    );

    console.log('✅ Comando INSERT_AUDIO_COMMAND registrado');
    
    return unregister;
  }, [editor]);

  return null;
}

// Hook para subir audios
export function useAudioUpload() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: MP3, WAV, OGG, M4A, WebM'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 50MB'
      };
    }

    return { valid: true };
  };

  const uploadAudio = async (file: File): Promise<string> => {
    try {
      console.log('📤 Iniciando upload de audio:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validar audio
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      console.log('✅ Validación de archivo exitosa');

      // Generar nombre único
      const fileName = StorageService.generateFileName(file.name, 'editor-audio');
      console.log('📝 Nombre de archivo generado:', fileName);
      
      // Subir a Supabase
      const audioUrl = await StorageService.uploadFile(
        STORAGE_BUCKETS.EXAMENES,
        `editor-audios/${fileName}`,
        file,
        { upsert: true }
      );

      console.log('✅ Upload completado. URL:', audioUrl);
      return audioUrl;
    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      throw error;
    }
  };

  const insertAudio = async (file: File) => {
    try {
      console.log('🚀 Proceso de inserción de audio iniciado');
      
      const src = await uploadAudio(file);
      const title = file.name.split('.')[0]; // Usar nombre sin extensión como título
      
      console.log('📋 Datos para inserción:', { src, title });

      // Verificar que el editor esté listo
      if (!editor) {
        throw new Error('Editor no disponible');
      }

      // Usar insertaAudioDirectly en lugar del comando
      insertAudioDirectly(src, title);
      
    } catch (error) {
      console.error('❌ Error en insertAudio:', error);
      throw error;
    }
  };

  // Función para insertar audio directamente sin comando
  const insertAudioDirectly = (src: string, title: string) => {
    console.log('🔄 Insertando audio directamente...');
    
    editor.update(() => {
      try {
        const audioNode = $createAudioNode({ src, title });
        console.log('🎧 Nodo de audio creado directamente:', audioNode);
        
        const selection = $getSelection();
        console.log('📍 Selección actual:', selection);
        
        if ($isRangeSelection(selection)) {
          console.log('✅ Insertando en selección actual');
          $insertNodes([audioNode]);
        } else {
          console.log('⚠️ No hay selección, insertando al final');
          const root = $getRoot();
          root.append(audioNode);
        }
        
        console.log('✅ Audio insertado directamente en el editor');
      } catch (error) {
        console.error('❌ Error insertando audio directamente:', error);
        throw error;
      }
    });
  };

  const handleFileInput = () => {
    console.log('🖱️ Abriendo selector de archivos de audio...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 Archivo de audio seleccionado:', file);
    
    if (file) {
      try {
        await insertAudio(file);
        console.log('🎉 Proceso de audio completado exitosamente');
      } catch (error) {
        console.error('💥 Error en handleFileChange:', error);
        alert(error instanceof Error ? error.message : 'Error subiendo audio');
      }
      // Limpiar input
      event.target.value = '';
    }
  };

  return {
    insertAudio,
    handleFileInput,
    handleFileChange,
    fileInputRef,
  };
}