import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCattleById, getApplicationsForAnimal, type Ganado, type AplicacionesAnimalView } from '@/lib/appwrite';
import { getImageUrl } from '@/lib/imageUtils';
import ApplicationsSection from '@/components/ApplicationsSection';
import CattleImage from '@/components/CattleImage';
import DeleteCattleButtonWithNotification from '@/components/DeleteCattleButtonWithNotification';
import MarkAsSoldButton from '@/components/MarkAsSoldButton';
import { formatDateDisplay } from '@/lib/formatDateLocal';

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.', ',')} millones`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} mil`;
  }
  return amount.toFixed(0);
}

// Force dynamic rendering - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CattleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cattle = await getCattleById(id);
  const applications = await getApplicationsForAnimal(id);

  if (!cattle) {
    notFound();
  }

  // Procesar la URL de la imagen si existe
  let imageUrl = cattle.Imagen;
  if (imageUrl) {
    // Si la URL ya es una URL completa, la usamos directamente
    if (imageUrl.startsWith('http')) {
      // Verificar si es una URL antigua con /preview y convertirla a /view
      if (imageUrl.includes('/preview?')) {
        // Extraer el ID del archivo de la URL antigua
        const urlParts = imageUrl.split('/');
        const fileIdIndex = urlParts.findIndex(part => part === 'files') + 1;
        
        if (fileIdIndex > 0 && fileIdIndex < urlParts.length) {
          const fileId = urlParts[fileIdIndex];
          console.log('Converting old preview URL to view URL for file ID:', fileId);
          imageUrl = getImageUrl(fileId);
        } else {
          console.log('Using full URL for image (could not extract file ID):', imageUrl);
        }
      } else {
        console.log('Using full URL for image:', imageUrl);
      }
    } else {
      // Si es solo un ID de archivo, obtenemos la URL completa
      console.log('Getting URL for image ID:', imageUrl);
      imageUrl = getImageUrl(imageUrl);
    }
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
          <div className="ml-4 flex flex-wrap gap-2 sm:space-x-3 sm:flex-nowrap">
            <Link href={`/cattle/${id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
              Editar
            </Link>
            {!cattle.fecha_venta && (
              <MarkAsSoldButton
                cattleId={id}
                cattleName={cattle.id_animal}
              />
            )}
            <DeleteCattleButtonWithNotification
              cattleId={id}
              cattleName={cattle.id_animal}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Imagen del ganado */}
        {imageUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imagen del Ganado</h2>
            <div className="flex justify-center">
              <CattleImage
                src={imageUrl}
                alt={`Imagen de ${cattle.id_animal}`}
                className="max-w-full h-auto max-h-64 rounded-lg shadow-md object-contain"
              />
            </div>
            {/* Debug information - puede ser removido después */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              URL de imagen: {imageUrl.substring(0, 100)}...
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
              {cattle.farm_id && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID Finca</dt>
                  <dd className="text-sm text-gray-900">{cattle.farm_id}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Peso de Entrada</dt>
                <dd className="text-sm text-gray-900">{cattle.peso_entrada} kg</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Precio por Kg</dt>
                <dd className="text-sm text-gray-900">₡{cattle.precio_kg}</dd>
              </div>
              {cattle.Precio_compra && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio de Compra Total</dt>
                  <dd className="text-sm text-green-600 font-semibold">₡{formatCurrency(parseFloat(cattle.Precio_compra || '0'))}</dd>
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
                <dd className="text-sm text-green-600 font-semibold">{formatDateDisplay(cattle.fecha_compra)}</dd>
              </div>
              {cattle.fecha_venta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Venta</dt>
                  <dd className="text-sm text-red-600 font-semibold">{formatDateDisplay(cattle.fecha_venta)}</dd>
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
                  <dd className="text-sm text-red-600 font-semibold">₡{cattle.precio_kg_venta}</dd>
                </div>
              )}
              {cattle.Precio_venta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio de Venta Total</dt>
                  <dd className="text-sm text-red-600 font-semibold">₡{formatCurrency(parseFloat(cattle.Precio_venta || '0'))}</dd>
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
                  ₡{formatCurrency(applications
                    .filter(app => app.Costo)
                    .reduce((total, app) => total + (app.Costo || 0), 0))}
                </div>
                <p className="text-sm text-green-600">Costo total acumulado</p>
              </div>
            </div>
          </div>
        )}

        {/* Profit Summary */}
        {cattle.fecha_venta && cattle.Precio_venta && (
          <div className="mt-6 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resumen de Ganancia</h3>
                <p className="text-sm text-gray-600">
                  Ganancia neta del animal
                </p>
              </div>
              <div className="text-right">
                {(() => {
                  const totalAppCosts = applications
                    .filter(app => app.Costo)
                    .reduce((total, app) => total + (app.Costo || 0), 0);
                  const totalCost = parseFloat(cattle.Precio_compra || '0') + totalAppCosts;
                  const profit = parseFloat(cattle.Precio_venta || '0') - totalCost;
                  const isProfitable = profit > 0;
                  return (
                    <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      ₡{formatCurrency(profit)}
                    </div>
                  );
                })()}
                <p className="text-sm text-gray-600">Ganancia total</p>
              </div>
            </div>
            {(() => {
              const totalAppCosts = applications
                .filter(app => app.Costo)
                .reduce((total, app) => total + (app.Costo || 0), 0);
              const totalCost = parseFloat(cattle.Precio_compra || '0') + totalAppCosts;
              const profit = parseFloat(cattle.Precio_venta || '0') - totalCost;
              return (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Precio de Compra:</p>
                  <p className="font-semibold">₡{formatCurrency(parseFloat(cattle.Precio_compra || '0'))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Costos de Aplicaciones:</p>
                      <p className="font-semibold">₡{formatCurrency(totalAppCosts)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 font-medium">Costo Total:</p>
                      <p className="font-bold text-gray-900">₡{formatCurrency(totalCost)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 font-medium">Precio de Venta:</p>
                      <p className="font-bold text-red-600">₡{formatCurrency(parseFloat(cattle.Precio_venta || '0'))}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
