import React from 'react';
import { MapPin } from 'lucide-react';

interface DireccionDisplayProps {
  direccion: string;
  className?: string;
  showIcon?: boolean;
}

export const DireccionDisplay: React.FC<DireccionDisplayProps> = ({ 
  direccion, 
  className = '', 
  showIcon = true 
}) => {
  if (!direccion) return null;

  // Dividir la dirección en líneas para mejor visualización
  const lineas = direccion.split('\n').filter(linea => linea.trim());

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      {showIcon && <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-muted" />}
      <div className="text-sm text-text-muted leading-relaxed">
        {lineas.map((linea, index) => (
          <div key={index} className={index > 0 ? 'mt-1' : ''}>
            {linea}
          </div>
        ))}
      </div>
    </div>
  );
};