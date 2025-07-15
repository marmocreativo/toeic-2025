import { useParams } from 'react-router-dom';

export default function Centros() {
  const { estado } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Centros de Examen {estado ? `- ${estado}` : ''}
      </h1>
      <p className="text-gray-600">
        Lista de centros disponibles.
      </p>
    </div>
  );
}