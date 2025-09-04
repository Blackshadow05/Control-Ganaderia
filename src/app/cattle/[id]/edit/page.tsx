import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase, type Ganado } from '@/lib/supabase';
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

async function updateCattle(id: number, formData: FormData) {
  'use server';

  const data = {
    id_animal: formData.get('id_animal') as string,
    peso_entrada: parseFloat(formData.get('peso_entrada') as string),
    precio_kg: parseFloat(formData.get('precio_kg') as string),
    Precio_compra: formData.get('Precio_compra') ? parseFloat(formData.get('Precio_compra') as string) : null,
    peso_salida: formData.get('peso_salida') ? parseFloat(formData.get('peso_salida') as string) : null,
    precio_kg_venta: formData.get('precio_kg_venta') ? parseFloat(formData.get('precio_kg_venta') as string) : null,
    Precio_venta: formData.get('Precio_venta') ? parseFloat(formData.get('Precio_venta') as string) : null,
    farm_nombre: formData.get('farm_nombre') as string,
    fecha_compra: formData.get('fecha_compra') as string,
    fecha_venta: formData.get('fecha_venta') ? formData.get('fecha_venta') as string : null,
  };

  // Validate data
  const validation = cattleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((e: any) => e.message).join(', '));
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
  const cattle = await getCattleById(parseInt(id));

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
        <CattleEditForm cattle={cattle} onSubmit={updateCattle.bind(null, cattle.id)} />
      </div>
    </div>
  );
}