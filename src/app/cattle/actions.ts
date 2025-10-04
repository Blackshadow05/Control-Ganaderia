'use server'

import { redirect } from 'next/navigation';
import { createCattle as createCattleInAppwrite, updateCattle as updateCattleInAppwrite, deleteCattle as deleteCattleFromAppwrite, getFarmById, getFarmByAppwriteId, type Ganado } from '@/lib/appwrite';
import { cattleSchema } from '@/lib/validations';

export async function createCattle(formData: FormData) {
  const farmIdValue = formData.get('farm_id');
  const farmId = farmIdValue as string;

  if (!farmId) {
    throw new Error('ID de la finca es requerido');
  }

  // Get farm data to set farm_nombre
  const farmData = await getFarmByAppwriteId(farmId);

  if (!farmData) {
    throw new Error('Error al obtener datos de la finca: Finca no encontrada');
  }

  const data = {
    id_animal: formData.get('id_animal') as string,
    peso_entrada: parseFloat(formData.get('peso_entrada') as string),
    precio_kg: parseFloat(formData.get('precio_kg') as string),
    Precio_compra: formData.get('Precio_compra') ? (formData.get('Precio_compra') as string) : null,
    peso_salida: formData.get('peso_salida') ? (formData.get('peso_salida') as string) : null,
    precio_kg_venta: formData.get('precio_kg_venta') ? parseFloat(formData.get('precio_kg_venta') as string) : null,
    Precio_venta: formData.get('Precio_venta') ? (formData.get('Precio_venta') as string) : null,
    farm_id: farmId,
    farm_nombre: `${farmData["Nombre-finca"] || ''} - ${farmData["Nombre_apartado"] || ''}`,
    fecha_compra: formData.get('fecha_compra') as string,
    fecha_venta: formData.get('fecha_venta') ? formData.get('fecha_venta') as string : null,
    Imagen: formData.get('Imagen') as string || null,
  };

  // Validate data
  const validation = cattleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((issue: { message: string }) => issue.message).join(', '));
  }

  // Insert into Appwrite
  try {
    await createCattleInAppwrite(validation.data);
  } catch (error) {
    throw new Error('Error al guardar el ganado: ' + error);
  }

  redirect('/cattle');
}

export async function createCattleWithResult(formData: FormData) {
  const farmIdValue = formData.get('farm_id');
  const farmId = farmIdValue as string;

  if (!farmId) {
    throw new Error('ID de la finca es requerido');
  }

  // Get farm data to set farm_nombre
  const farmData = await getFarmByAppwriteId(farmId);

  if (!farmData) {
    throw new Error('Error al obtener datos de la finca: Finca no encontrada');
  }

  const data = {
    id_animal: formData.get('id_animal') as string,
    peso_entrada: parseFloat(formData.get('peso_entrada') as string),
    precio_kg: parseFloat(formData.get('precio_kg') as string),
    Precio_compra: formData.get('Precio_compra') ? (formData.get('Precio_compra') as string) : null,
    peso_salida: formData.get('peso_salida') ? (formData.get('peso_salida') as string) : null,
    precio_kg_venta: formData.get('precio_kg_venta') ? parseFloat(formData.get('precio_kg_venta') as string) : null,
    Precio_venta: formData.get('Precio_venta') ? (formData.get('Precio_venta') as string) : null,
    farm_id: farmId,
    farm_nombre: `${farmData["Nombre-finca"] || ''} - ${farmData["Nombre_apartado"] || ''}`,
    fecha_compra: formData.get('fecha_compra') as string,
    fecha_venta: formData.get('fecha_venta') ? formData.get('fecha_venta') as string : null,
    Imagen: formData.get('Imagen') as string || null,
  };

  // Validate data
  const validation = cattleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((issue: { message: string }) => issue.message).join(', '));
  }

  // Insert into Appwrite
  try {
    const insertedData = await createCattleInAppwrite(validation.data);

    // Return success result instead of redirecting
    return {
      success: true,
      message: 'Ganado registrado exitosamente',
      data: insertedData
    };
  } catch (error) {
    throw new Error('Error al guardar el ganado: ' + error);
  }
}

export async function updateCattle(id: string, formData: FormData) {
  const farmIdValue = formData.get('farm_id');
  const farmId = farmIdValue ? parseInt(farmIdValue as string) : null;

  let farmNombre = formData.get('farm_nombre') as string;

  // If farm_id is provided, get the farm data
  if (farmId) {
    const farmData = await getFarmByAppwriteId(farmId);

    if (!farmData) {
      throw new Error('Error al obtener datos de la finca: Finca no encontrada');
    }

    farmNombre = `${farmData["Nombre-finca"] || ''} - ${farmData["Nombre_apartado"] || ''}`;
  }

  const data = {
    id_animal: formData.get('id_animal') as string,
    peso_entrada: parseFloat(formData.get('peso_entrada') as string),
    precio_kg: parseFloat(formData.get('precio_kg') as string),
    Precio_compra: formData.get('Precio_compra') ? parseFloat(formData.get('Precio_compra') as string) : null,
    peso_salida: formData.get('peso_salida') ? parseFloat(formData.get('peso_salida') as string) : null,
    precio_kg_venta: formData.get('precio_kg_venta') ? parseFloat(formData.get('precio_kg_venta') as string) : null,
    Precio_venta: formData.get('Precio_venta') ? parseFloat(formData.get('Precio_venta') as string) : null,
    farm_id: farmId,
    farm_nombre: farmNombre,
    fecha_compra: formData.get('fecha_compra') as string,
    fecha_venta: formData.get('fecha_venta') ? formData.get('fecha_venta') as string : null,
    Imagen: formData.get('Imagen') as string || null,
  };

  // Validate data
  const validation = cattleSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Datos inválidos: ' + validation.error.issues.map((issue: { message: string }) => issue.message).join(', '));
  }

  // Update in Appwrite
  try {
    await updateCattleInAppwrite(id, validation.data);
  } catch (error) {
    throw new Error('Error al actualizar el ganado: ' + error);
  }

  redirect(`/cattle/${id}`);
}

export async function deleteCattleWithResult(id: string) {
  try {
    await deleteCattleFromAppwrite(id);

    // Return success result instead of redirecting
    return {
      success: true,
      message: 'Ganado eliminado exitosamente'
    };
  } catch (error) {
    throw new Error('Error al eliminar el ganado: ' + error);
  }
}
