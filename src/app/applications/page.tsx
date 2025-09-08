import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Aplicaciones } from '@/lib/supabase';
import DeleteApplicationButton from '@/components/DeleteApplicationButton';

async function getApplications(): Promise<Aplicaciones[]> {
  const { data, error } = await supabase
    .from('Aplicaciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data || [];
}

export default async function ApplicationsPage() {
  const applications = await getApplications();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestión de productos veterinarios</p>
        </div>
        <Link href="/applications/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Nuevo Producto
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white shadow rounded-lg overflow-hidden hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {app.Nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {app.Tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {app.Descripcion || 'Sin descripción'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/applications/${app.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Editar
                  </Link>
                  <DeleteApplicationButton applicationId={app.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{app.Nombre}</h3>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
                  {app.Tipo}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(app.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
            
            {app.Descripcion && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {app.Descripcion}
              </p>
            )}
            
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Link
                href={`/applications/${app.id}/edit`}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Editar
              </Link>
              <DeleteApplicationButton applicationId={app.id} />
            </div>
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos registrados</h3>
          <p className="text-gray-600 mb-6">Comienza registrando tu primer producto.</p>
          <Link href="/applications/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Nuevo Producto
          </Link>
        </div>
      )}
    </div>
  );
}