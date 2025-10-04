export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  getApplicationForAnimalById,
  updateApplicationForAnimal,
  getApplications,
  type AplicacionesAnimalView
} from '@/lib/appwrite';
import { aplicacionesAnimalSchema } from '@/lib/validations';

async function updateApplication(applicationId: string, formData: FormData) {
  'use server';

  const data = {
    Producto: formData.get('Producto') as string,
    Cantidad: formData.get('Cantidad') as string,
    Costo: formData.get('Costo') ? parseFloat(formData.get('Costo') as string) : null,
    Motivo: formData.get('Motivo') as string || null,
  };

  // Validate data
  const validation = aplicacionesAnimalSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((issue: { message: string }) => issue.message).join(', '));
  }

  // Update in Appwrite
  try {
    await updateApplicationForAnimal(applicationId, validation.data);
  } catch (error) {
    throw new Error('Error al actualizar la aplicación: ' + (error as Error).message);
  }

  // Get the animal ID to redirect back
  const appData = await getApplicationForAnimalById(applicationId);

  redirect(`/cattle/${appData?.Id_animal}`);
}

// Fetch application data from Appwrite
async function getApplicationById(applicationId: string): Promise<AplicacionesAnimalView | null> {
  return await getApplicationForAnimalById(applicationId);
}

// Fetch products from Aplicaciones table
async function getProductos(): Promise<string[]> {
  try {
    const data = await getApplications();
    
    // Get unique product names, filtering out null values
    const uniqueProductos = [...new Set(data.map(item => item.Nombre).filter((name): name is string => Boolean(name)))];
    return uniqueProductos;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string; applicationId: string }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const { id, applicationId } = await params;
  const application = await getApplicationById(applicationId);
  const productos = await getProductos();

  if (!application) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href={`/cattle/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Detalles del Animal
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Aplicación</h1>
        <p className="text-gray-600 mt-1">Modificar los detalles de la aplicación</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form action={async (formData: FormData) => {
          'use server';
          await updateApplication(applicationId, formData);
        }} className="space-y-6">
          <div>
            <label htmlFor="Producto" className="block text-sm font-medium text-gray-700">
              Producto
            </label>
            <select
              id="Producto"
              name="Producto"
              defaultValue={application.Producto || ''}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                Selecciona un producto
              </option>
              {productos.map((producto, index) => (
                <option key={index} value={producto}>
                  {producto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="Cantidad" className="block text-sm font-medium text-gray-700">
              Cantidad
            </label>
            <input
              type="text"
              id="Cantidad"
              name="Cantidad"
              defaultValue={application.Cantidad || ''}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cantidad aplicada"
            />
          </div>

          <div>
            <label htmlFor="Costo" className="block text-sm font-medium text-gray-700">
              Costo
            </label>
            <input
              type="number"
              id="Costo"
              name="Costo"
              step="0.01"
              defaultValue={application.Costo || ''}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Costo en colones (opcional)"
            />
          </div>

          <div>
            <label htmlFor="Motivo" className="block text-sm font-medium text-gray-700">
              Motivo
            </label>
            <textarea
              id="Motivo"
              name="Motivo"
              rows={3}
              defaultValue={application.Motivo || ''}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Motivo de la aplicación (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link href={`/cattle/${id}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
