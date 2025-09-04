import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Finca } from '@/lib/supabase';

async function getLots(): Promise<Finca[]> {
  const { data, error } = await supabase
    .from('Finca')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lots:', error);
    return [];
  }

  return data || [];
}

export default async function LotsPage() {
  const lots = await getLots();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lotes</h1>
          <p className="text-gray-600 mt-1">Gestión de ubicaciones y lotes de la finca</p>
        </div>
        <Link href="/lots/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Nuevo Lote
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => (
          <div key={lot.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{lot['Nombre-finca']}</h3>
              <span className="text-2xl">🌾</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Apartado:</span> {lot['Nombre_apartado']}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fecha de creación:</span> {new Date(lot.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Link href={`/lots/${lot.id}`} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Ver Detalles
              </Link>
              <Link href={`/lots/${lot.id}/edit`} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Editar
              </Link>
              <form action={async () => {
                'use server';
                const { error } = await supabase
                  .from('Finca')
                  .delete()
                  .eq('id', lot.id);

                if (error) {
                  console.error('Error deleting lot:', error);
                }
              }} className="inline">
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {lots.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay lotes registrados</h3>
          <p className="text-gray-600 mb-6">Comienza creando tu primer lote.</p>
          <Link href="/lots/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Nuevo Lote
          </Link>
        </div>
      )}
    </div>
  );
}