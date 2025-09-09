export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase, type Ganado, type Finca } from '@/lib/supabase';
import { cattleSchema } from '@/lib/validations';
import CattleEditForm from './CattleEditForm';
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

// Fetch all fincas for the dropdown
async function getFincas(): Promise<Finca[]> {
  const { data, error } = await supabase
    .from('Finca')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fincas:', error);
    return [];
  }

  return data || [];
}

async function updateCattle(id: number, formData: FormData) {
  'use server';

  const farmIdValue = formData.get('farm_id');
  const farmId = farmIdValue ? parseInt(farmIdValue as string) : null;
  
  if (!farmId) {
    throw new Error('ID de la finca es requerido');
  }

  // Get farm data to set farm_nombre
  const { data: farmData, error: farmError } = await supabase
    .from('Finca')
    .select('*')
    .eq('id', farmId)
    .single();

  if (farmError || !farmData) {
    throw new Error('Error al obtener datos de la finca: ' + (farmError?.message || 'Finca no encontrada'));
  }

  // Get all form values with proper validation
  const idAnimal = formData.get('id_animal') as string;
  const pesoEntradaStr = formData.get('peso_entrada') as string;
  const precioKgStr = formData.get('precio_kg') as string;
  const precioCompraStr = formData.get('Precio_compra') as string;
  const pesoSalidaStr = formData.get('peso_salida') as string;
  const precioKgVentaStr = formData.get('precio_kg_venta') as string;
  const precioVentaStr = formData.get('Precio_venta') as string;
  const fechaCompra = formData.get('fecha_compra') as string;
  const fechaVenta = formData.get('fecha_venta') as string;
  const imagen = formData.get('Imagen') as string;

  console.log('Form values:', {
    idAnimal,
    pesoEntradaStr,
    precioKgStr,
    precioCompraStr,
    pesoSalidaStr,
    precioKgVentaStr,
    precioVentaStr,
    fechaCompra,
    fechaVenta,
    imagen,
    farmId
  });

  // Parse numeric values with validation
  const pesoEntrada = pesoEntradaStr ? parseFloat(pesoEntradaStr) : null;
  const precioKg = precioKgStr ? parseFloat(precioKgStr) : null;
  const precioCompra = precioCompraStr ? parseFloat(precioCompraStr) : null;
  const pesoSalida = pesoSalidaStr ? parseFloat(pesoSalidaStr) : null;
  const precioKgVenta = precioKgVentaStr ? parseFloat(precioKgVentaStr) : null;
  const precioVenta = precioVentaStr ? parseFloat(precioVentaStr) : null;

  if (!idAnimal || !pesoEntrada || !precioKg || !fechaCompra) {
    throw new Error('Campos requeridos faltantes: id_animal, peso_entrada, precio_kg, fecha_compra');
  }

  const data = {
    id_animal: idAnimal,
    peso_entrada: pesoEntrada,
    precio_kg: precioKg,
    Precio_compra: precioCompra,
    peso_salida: pesoSalida,
    precio_kg_venta: precioKgVenta,
    Precio_venta: precioVenta,
    farm_id: farmId,
    farm_nombre: `${farmData["Nombre-finca"]} - ${farmData["Nombre_apartado"]}`,
    fecha_compra: fechaCompra,
    fecha_venta: fechaVenta || null,
    Imagen: imagen || null,
  };

  console.log('Data to validate:', data);

  // Validate data
  const validation = cattleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((issue: { message: string }) => issue.message).join(', '));
  }

  // Update in Supabase
  const { error } = await supabase
    .from('Ganado')
    .update(validation.data)
    .eq('id', id);

  if (error) {
    throw new Error('Error al actualizar el ganado: ' + error.message);
  }

  redirect(`/cattle/${id}`);
}



interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CattleEditPage({ params }: PageProps) {
  const { id } = await params;
  const [cattle, fincas] = await Promise.all([
    getCattleById(parseInt(id)),
    getFincas()
  ]);

  if (!cattle) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href={`/cattle/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Detalles
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar {cattle.id_animal}</h1>
        <p className="text-gray-600 mt-1">Modificar información del ganado</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CattleEditForm cattle={cattle} fincas={fincas} onSubmit={updateCattle.bind(null, cattle.id)} />
      </div>
    </div>
  );
}
