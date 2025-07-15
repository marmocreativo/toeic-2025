import { useParams } from 'react-router-dom';

export default function PaginaDetalle() {
  const { url } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Página: {url}
      </h1>
      <p className="text-gray-600">
        Contenido de la página.
      </p>
    </div>
  );
}