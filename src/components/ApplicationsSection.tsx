'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, type AplicacionesAnimal } from '@/lib/supabase';

interface ApplicationsSectionProps {
  applications: AplicacionesAnimal[];
  cattleId: string;
}

export default function ApplicationsSection({ applications, cattleId }: ApplicationsSectionProps) {
  const router = useRouter();

  const handleDeleteApplication = async (applicationId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) {
      try {
        const { error } = await supabase
          .from('AplicacionesAnimal')
          .delete()
          .eq('id', applicationId);

        if (error) {
          alert('Error al eliminar la aplicación: ' + error.message);
        } else {
          alert('Aplicación eliminada exitosamente');
          router.refresh(); // Refresh the page to update the list
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        alert('Error al eliminar la aplicación: ' + message);
      }
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Historial de Aplicaciones</h2>
        <Link
          href={`/cattle/${cattleId}/application/new`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Nueva Aplicación
        </Link>
      </div>

      {applications.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
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
                      {app.Producto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.Cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.Costo ? `₡${app.Costo.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {app.Motivo || 'Sin motivo especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/cattle/${cattleId}/application/${app.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
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
                  <h3 className="text-lg font-semibold text-gray-900">{app.Producto}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {new Date(app.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cantidad</p>
                    <p className="text-sm text-gray-900">{app.Cantidad}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Costo</p>
                    <p className="text-sm text-gray-900">
                      {app.Costo ? `₡${app.Costo.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {app.Motivo && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-500">Motivo</p>
                    <p className="text-sm text-gray-900">{app.Motivo}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-3 border-t border-gray-200">
                  <Link
                    href={`/cattle/${cattleId}/application/${app.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💉</div>
          <p className="text-gray-600">No hay aplicaciones registradas para este animal</p>
          <p className="text-sm text-gray-500 mt-2">Haz click en &quot;Nueva Aplicación&quot; para comenzar</p>
        </div>
      )}
    </div>
  );
}
