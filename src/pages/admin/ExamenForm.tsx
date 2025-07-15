import { useParams } from 'react-router-dom';

export default function AdminExamenForm() {
  const { id } = useParams();
  const isEditing = !!id;
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Examen' : 'Nuevo Examen'}
      </h1>
      <p className="text-gray-600">
        Formulario para {isEditing ? 'editar' : 'crear'} exámenes.
      </p>
    </div>
  );
}