import { useParams } from 'react-router-dom';

export default function AdminPaginaForm() {
  const { id } = useParams();
  const isEditing = !!id;
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Página' : 'Nueva Página'}
      </h1>
      <p className="text-gray-600">
        Formulario para {isEditing ? 'editar' : 'crear'} páginas.
      </p>
    </div>
  );
}