import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase, type Ganado, type AplicacionesAnimal } from '@/lib/supabase';
import ApplicationsSection from '@/components/ApplicationsSection';
import CattleImage from '@/components/CattleImage';
import { Button } from '@/components/ui/Button';

// Fetch cattle data from Supabase
async function getCattleById(id: number): Promise<Ganado | null> {
  const { data, error } = await supabase
    .from('Ganado')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching cattle:', error);
    return null;
  }

  return data;
}

// Fetch applications for this animal from Supabase
async function getApplicationsForAnimal(animalId: string): Promise<AplicacionesAnimal[]> {
  const { data, error } = await supabase
    .from('AplicacionesAnimal')
    .select('*')
    .eq('Id_animal', animalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data || [];
}

// Delete application
async function deleteApplication(applicationId: number) {
  'use server';

  const { error } = await supabase
    .from('AplicacionesAnimal')
    .delete()
    .eq('id', applicationId);

  if (error) {
    throw new Error('Error al eliminar la aplicación: ' + error.message);
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CattleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cattle = await getCattleById(parseInt(id));
  const applications = await getApplicationsForAnimal(id);

  if (!cattle) {
    notFound();
  }


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/cattle" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Ganado
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cattle.id_animal}</h1>
            <p className="text-gray-600 mt-1">Detalles del ganado</p>
          </div>
          <div className="ml-4">
            <Link href={`/cattle/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Editar Ganado
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Imagen del ganado */}
        {cattle.Imagen && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imagen del Ganado</h2>
            <div className="flex justify-center">
              <CattleImage
                src={cattle.Imagen}
                alt={`Imagen de ${cattle.id_animal}`}
                className="max-w-full h-auto max-h-64 rounded-lg shadow-md object-contain"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID del Animal</dt>
                <dd className="text-sm text-gray-900">{cattle.id_animal}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Finca</dt>
                <dd className="text-sm text-gray-900">{cattle.farm_nombre}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Peso de Entrada</dt>
                <dd className="text-sm text-gray-900">{cattle.peso_entrada} kg</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Precio por Kg</dt>
                <dd className="text-sm text-gray-900">${cattle.precio_kg}</dd>
              </div>
              {cattle.Precio_compra && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio de Compra Total</dt>
                  <dd className="text-sm text-gray-900">₡{cattle.Precio_compra.toFixed(2)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado y Fechas</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cattle.fecha_venta ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {cattle.fecha_venta ? 'Vendido' : 'Activo'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Compra</dt>
                <dd className="text-sm text-gray-900">{new Date(cattle.fecha_compra).toLocaleDateString('es-ES')}</dd>
              </div>
              {cattle.fecha_venta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Venta</dt>
                  <dd className="text-sm text-gray-900">{new Date(cattle.fecha_venta).toLocaleDateString('es-ES')}</dd>
                </div>
              )}
              {cattle.peso_salida && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Peso de Salida</dt>
                  <dd className="text-sm text-gray-900">{cattle.peso_salida} kg</dd>
                </div>
              )}
              {cattle.precio_kg_venta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio Venta/kg</dt>
                  <dd className="text-sm text-gray-900">${cattle.precio_kg_venta}</dd>
                </div>
              )}
              {cattle.Precio_venta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio de Venta Total</dt>
                  <dd className="text-sm text-gray-900">₡{cattle.Precio_venta.toFixed(2)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <ApplicationsSection applications={applications} cattleId={id} />

        {/* Total Cost Summary */}
        {applications.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Total de Costos</h3>
                <p className="text-sm text-green-600">
                  {applications.filter(app => app.Costo).length} aplicaciones con costo registrado
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  ₡{applications
                    .filter(app => app.Costo)
                    .reduce((total, app) => total + (app.Costo || 0), 0)
                    .toFixed(2)}
                </div>
                <p className="text-sm text-green-600">Costo total acumulado</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
