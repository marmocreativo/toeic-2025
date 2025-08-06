// src/components/ui/LexicalImagePlugin.tsx - Versión final con comando corregido
import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, $getSelection, $isRangeSelection, $getRoot } from 'lexical';
import { createCommand, type LexicalCommand } from 'lexical';
import { $createImageNode, ImageNode } from './LexicalImageNode';
import { StorageService, STORAGE_BUCKETS } from '../../services/storageService';

// Comando para insertar imagen con nombre único
export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  altText: string;
  src: string;
}> = createCommand('INSERT_CUSTOM_IMAGE_COMMAND');

// Plugin para manejar imágenes
export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log('🔧 Inicializando ImagePlugin...');
    
    if (!editor.hasNodes([ImageNode])) {
      console.error('❌ ImageNode no está registrado en el editor');
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }
    
    console.log('✅ ImageNode registrado correctamente');

    const unregister = editor.registerCommand<{
      altText: string;
      src: string;
    }>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        console.log('📸 Comando INSERT_IMAGE_COMMAND ejecutado con payload:', payload);
        
        try {
          const imageNode = $createImageNode(payload);
          console.log('🖼️ Nodo de imagen creado:', imageNode);
          
          const selection = $getSelection();
          console.log('📍 Selección actual:', selection);
          
          if ($isRangeSelection(selection)) {
            // Insertar en la selección actual
            console.log('✅ Insertando en selección actual');
            $insertNodes([imageNode]);
          } else {
            // Si no hay selección, insertar al final del documento
            console.log('⚠️ No hay selección, insertando al final');
            const root = $getRoot();
            root.append(imageNode);
          }
          
          console.log('✅ Imagen insertada en el editor');
          return true;
        } catch (error) {
          console.error('❌ Error en comando INSERT_IMAGE:', error);
          return false;
        }
      },
      COMMAND_PRIORITY_EDITOR,
    );

    console.log('✅ Comando INSERT_IMAGE_COMMAND registrado');
    
    return unregister;
  }, [editor]);

  return null;
}

// Hook para subir imágenes
export function useImageUpload() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('📤 Iniciando upload de imagen:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validar imagen
      const validation = StorageService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      console.log('✅ Validación de archivo exitosa');

      // Generar nombre único
      const fileName = StorageService.generateFileName(file.name, 'editor-image');
      console.log('📝 Nombre de archivo generado:', fileName);
      
      // Subir a Supabase
      const imageUrl = await StorageService.uploadFile(
        STORAGE_BUCKETS.EXAMENES,
        `editor-images/${fileName}`,
        file,
        { upsert: true }
      );

      console.log('✅ Upload completado. URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  };

  const insertImage = async (file: File) => {
    try {
      console.log('🚀 Proceso de inserción de imagen iniciado');
      
      const src = await uploadImage(file);
      const altText = file.name.split('.')[0];
      
      console.log('📋 Datos para inserción:', { src, altText });

      // Verificar que el editor esté listo
      if (!editor) {
        throw new Error('Editor no disponible');
      }

      // Usar insertaImageDirectly en lugar del comando
      insertImageDirectly(src, altText);
      
    } catch (error) {
      console.error('❌ Error en insertImage:', error);
      throw error;
    }
  };

  // Función para insertar imagen directamente sin comando
  const insertImageDirectly = (src: string, altText: string) => {
    console.log('🔄 Insertando imagen directamente...');
    
    editor.update(() => {
      try {
        const imageNode = $createImageNode({ altText, src });
        console.log('🖼️ Nodo de imagen creado directamente:', imageNode);
        
        const selection = $getSelection();
        console.log('📍 Selección actual:', selection);
        
        if ($isRangeSelection(selection)) {
          console.log('✅ Insertando en selección actual');
          $insertNodes([imageNode]);
        } else {
          console.log('⚠️ No hay selección, insertando al final');
          const root = $getRoot();
          root.append(imageNode);
        }
        
        console.log('✅ Imagen insertada directamente en el editor');
      } catch (error) {
        console.error('❌ Error insertando imagen directamente:', error);
        throw error;
      }
    });
  };

  const handleFileInput = () => {
    console.log('🖱️ Abriendo selector de archivos...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 Archivo seleccionado:', file);
    
    if (file) {
      try {
        await insertImage(file);
        console.log('🎉 Proceso completado exitosamente');
      } catch (error) {
        console.error('💥 Error en handleFileChange:', error);
        alert(error instanceof Error ? error.message : 'Error subiendo imagen');
      }
      // Limpiar input
      event.target.value = '';
    }
  };

  return {
    insertImage,
    handleFileInput,
    handleFileChange,
    fileInputRef,
  };
}