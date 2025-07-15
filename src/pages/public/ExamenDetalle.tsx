import { useParams } from 'react-router-dom';

export default function ExamenDetalle() {
  const { url } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Detalle del Examen: {url}
      </h1>
      <p className="text-gray-600">
        Información detallada del examen.
      </p>
    </div>
  );
}