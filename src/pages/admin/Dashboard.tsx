export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard de Administración
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Exámenes</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Centros</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Páginas</h3>
          <p className="text-3xl font-bold text-purple-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Sliders</h3>
          <p className="text-3xl font-bold text-orange-600">3</p>
        </div>
      </div>
    </div>
  );
}