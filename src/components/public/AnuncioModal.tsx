// src/components/public/AnuncioModal.tsx

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { anuncioService } from '../../services/anuncioService';
import { useLanguage } from '../../hooks/useLanguage';
import type { AnuncioActivo } from '../../types/anuncio';

interface AnuncioModalProps {
  // Props opcionales para controlar manualmente el modal
  forceShow?: boolean;
  onClose?: () => void;
  persistent?: boolean; // Nueva prop para controlar persistencia
}

export default function AnuncioModal({ forceShow = false, onClose, persistent = true }: AnuncioModalProps) {
  const { language } = useLanguage();
  const [anuncio, setAnuncio] = useState<AnuncioActivo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Cargar anuncio activo
  useEffect(() => {
    const loadAnuncio = async () => {
      try {
        const anuncioActivo = await anuncioService.getAnuncioActivo(language);
        setAnuncio(anuncioActivo);
        
        // Si hay anuncio activo, mostrarlo
        if (anuncioActivo) {
          if (persistent || forceShow) {
            // Modo persistente: siempre mostrar
            setIsVisible(true);
          } else {
            // Modo no persistente: verificar localStorage
            const storageKey = `anuncio_shown_${anuncioActivo.id}`;
            const wasShown = localStorage.getItem(storageKey);
            
            if (!wasShown) {
              setIsVisible(true);
              localStorage.setItem(storageKey, 'true');
            }
          }
        }
      } catch (error) {
        console.error('Error cargando anuncio:', error);
        // No mostrar error al usuario, simplemente no mostrar anuncio
      }
    };

    loadAnuncio();
  }, [language, forceShow, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleImageClick = () => {
    if (anuncio?.link) {
      window.open(anuncio.link, '_blank', 'noopener,noreferrer');
      handleClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // No renderizar si no hay anuncio o no es visible
  if (!anuncio || !isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black-30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
          aria-label="Cerrar anuncio"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Contenido del anuncio */}
        <div className="relative">
          {/* Imagen principal */}
          <div 
            className={`relative ${anuncio.link ? 'cursor-pointer' : ''}`}
            onClick={anuncio.link ? handleImageClick : undefined}
          >
            <img
              src={anuncio.imagen}
              alt={anuncio.titulo}
              className="w-full max-h-[80vh] object-contain"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {/* Indicador de enlace */}
            {anuncio.link && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4" />
                <span>Hacer clic para abrir</span>
              </div>
            )}
          </div>

          {/* Título (si existe) */}
          {anuncio.titulo && (
            <div className="p-4 bg-white">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                {anuncio.titulo}
              </h3>
            </div>
          )}

          {/* Botón de enlace alternativo (si hay enlace) */}
          {anuncio.link && (
            <div className="p-4 bg-gray-50 flex justify-center">
              <button
                onClick={handleImageClick}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ir al enlace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook para usar el modal de anuncios
export function useAnuncioModal() {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return {
    showModal,
    openModal,
    closeModal,
    AnuncioModalComponent: () => (
      <AnuncioModal 
        forceShow={showModal} 
        onClose={closeModal} 
      />
    )
  };
}

// Componente que se puede usar en cualquier página para mostrar anuncios automáticamente
// PERSISTENTE: Se muestra siempre que haya anuncio activo
export function AutoAnuncioModal() {
  return <AnuncioModal persistent={true} />;
}

// Componente que se muestra solo una vez (comportamiento anterior)
export function OneTimeAnuncioModal() {
  return <AnuncioModal persistent={false} />;
}