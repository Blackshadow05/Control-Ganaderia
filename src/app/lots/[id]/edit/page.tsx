import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase, type Finca } from '@/lib/supabase';
import { fincaSchema } from '@/lib/validations';

async function updateLot(id: number, formData: FormData) {
  'use server';

  const data = {
    "Nombre-finca": formData.get('Nombre-finca') as string,
    "Nombre_apartado": formData.get('Nombre_apartado') as string,
  };

  // Validate data
  const validation = fincaSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((e: { message: string }) => e.message).join(', '));
  }

  // Update in Supabase
  const { error } = await supabase
    .from('Finca')
    .update(validation.data)
    .eq('id', id);

  if (error) {
    throw new Error('Error al actualizar el lote: ' + error.message);
  }

  redirect(`/lots/${id}`);
}

async function deleteLot(id: number) {
  'use server';

  // Delete from Supabase
  const { error } = await supabase
    .from('Finca')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Error al eliminar el lote: ' + error.message);
  }

  redirect('/lots');
}

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

export default async function LotEditPage({ params }: PageProps) {
  const { id } = await params;
  const lot = await getLotById(parseInt(id));

  if (!lot) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href={`/lots/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Detalles
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar {lot['Nombre-finca']}</h1>
        <p className="text-gray-600 mt-1">Modificar información del lote</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form action={async (formData: FormData) => {
          'use server';
          await updateLot(lot.id, formData);
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="Nombre-finca" className="block text-sm font-medium text-gray-700">
                Nombre de la Finca
              </label>
              <input
                type="text"
                id="Nombre-finca"
                name="Nombre-finca"
                defaultValue={lot['Nombre-finca'] || ''}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="Nombre_apartado" className="block text-sm font-medium text-gray-700">
                Nombre del Apartado
              </label>
              <input
                type="text"
                id="Nombre_apartado"
                name="Nombre_apartado"
                defaultValue={lot['Nombre_apartado'] || ''}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <form action={async () => {
              'use server';
              await deleteLot(lot.id);
            }}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar Lote
              </button>
            </form>

            <div className="flex space-x-4">
              <Link href={`/lots/${id}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}