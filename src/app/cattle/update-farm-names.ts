'use server'

import { supabase } from '@/lib/supabase';

/**
 * Actualiza el campo farm_nombre en todos los registros de Ganado
 * basándose en los datos actuales de la tabla Finca
 */
export async function updateAllFarmNames() {
  try {
    // Obtener todos los registros de Ganado que tengan un farm_id
    const { data: ganadoData, error: ganadoError } = await supabase
      .from('Ganado')
      .select('id, farm_id')
      .not('farm_id', 'is', null);

    if (ganadoError) {
      throw new Error('Error al obtener datos de Ganado: ' + ganadoError.message);
    }

    if (!ganadoData || ganadoData.length === 0) {
      return { success: true, message: 'No hay registros de Ganado para actualizar' };
    }

    // Actualizar cada registro
    let updatedCount = 0;
    for (const ganado of ganadoData) {
      const { data: fincaData, error: fincaError } = await supabase
        .from('Finca')
        .select('"Nombre-finca", "Nombre_apartado"')
        .eq('id', ganado.farm_id)
        .single();

      if (!fincaError && fincaData) {
        const farmNombre = `${fincaData["Nombre-finca"]} - ${fincaData["Nombre_apartado"]}`;
        
        const { error: updateError } = await supabase
          .from('Ganado')
          .update({ farm_nombre: farmNombre })
          .eq('id', ganado.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return { 
      success: true, 
      message: `Se actualizaron ${updatedCount} de ${ganadoData.length} registros de Ganado`
    };

  } catch (error) {
    console.error('Error al actualizar nombres de fincas:', error);
    return { 
      success: false, 
      message: 'Error al actualizar nombres de fincas: ' + (error as Error).message 
    };
  }
}

/**
 * Actualiza el campo farm_nombre para un registro específico de Ganado
 * @param ganadoId ID del registro de Ganado a actualizar
 */
export async function updateFarmName(ganadoId: number) {
  try {
    // Obtener el registro de Ganado
    const { data: ganadoData, error: ganadoError } = await supabase
      .from('Ganado')
      .select('farm_id')
      .eq('id', ganadoId)
      .single();

    if (ganadoError || !ganadoData) {
      throw new Error('Registro de Ganado no encontrado');
    }

    if (!ganadoData.farm_id) {
      return { success: true, message: 'El registro no tiene farm_id asociado' };
    }

    // Obtener los datos de la Finca
    const { data: fincaData, error: fincaError } = await supabase
      .from('Finca')
      .select('"Nombre-finca", "Nombre_apartado"')
      .eq('id', ganadoData.farm_id)
      .single();

    if (fincaError || !fincaData) {
      throw new Error('Finca asociada no encontrada');
    }

    const farmNombre = `${fincaData["Nombre-finca"]} - ${fincaData["Nombre_apartado"]}`;

    // Actualizar el registro
    const { error: updateError } = await supabase
      .from('Ganado')
      .update({ farm_nombre: farmNombre })
      .eq('id', ganadoId);

    if (updateError) {
      throw new Error('Error al actualizar el registro: ' + updateError.message);
    }

    return { 
      success: true, 
      message: 'Nombre de finca actualizado correctamente',
      farm_nombre: farmNombre
    };

  } catch (error) {
    console.error('Error al actualizar nombre de finca:', error);
    return { 
      success: false, 
      message: 'Error al actualizar nombre de finca: ' + (error as Error).message 
    };
  }
}