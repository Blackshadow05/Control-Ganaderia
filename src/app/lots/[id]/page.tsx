import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase, type Finca } from '@/lib/supabase';

// Fetch lot data from Supabase
async function getLotById(id: number): Promise<Finca | null> {
  const { data, error } = await supabase
    .from('Finca')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lot:', error);
    return null;
  }

  return data;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lot = await getLotById(parseInt(id));

  if (!lot) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/lots" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Lotes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{lot['Nombre-finca']}</h1>
        <p className="text-gray-600 mt-1">Detalles del lote</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Lote</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre de la Finca</dt>
                <dd className="text-sm text-gray-900">{lot['Nombre-finca']}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre del Apartado</dt>
                <dd className="text-sm text-gray-900">{lot['Nombre_apartado']}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Sistema</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID del Lote</dt>
                <dd className="text-sm text-gray-900">{lot.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                <dd className="text-sm text-gray-900">{new Date(lot.created_at).toLocaleDateString('es-ES')}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🌾</div>
            <p className="text-gray-600">Información adicional próximamente</p>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <Link href={`/lots/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Editar Lote
          </Link>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Eliminar Lote
          </button>
        </div>
      </div>
    </div>
  );
}