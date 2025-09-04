'use client'

import { useState, useEffect } from 'react';
import { type Ganado } from '@/lib/supabase';

interface CattleEditFormProps {
  cattle: Ganado;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function CattleEditForm({ cattle, onSubmit }: CattleEditFormProps) {
  const [pesoSalida, setPesoSalida] = useState('');
  const [precioKgVenta, setPrecioKgVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');

  // Calculate Precio_venta when peso_salida or precio_kg_venta changes
  useEffect(() => {
    if (pesoSalida && precioKgVenta) {
      const calculated = parseFloat(pesoSalida) * parseFloat(precioKgVenta);
      setPrecioVenta(calculated.toFixed(2));
    } else {
      setPrecioVenta('');
    }
  }, [pesoSalida, precioKgVenta]);

  // Initialize values from cattle data
  useEffect(() => {
    if (cattle.peso_salida) {
      setPesoSalida(cattle.peso_salida.toString());
    }
    if (cattle.precio_kg_venta) {
      setPrecioKgVenta(cattle.precio_kg_venta.toString());
    }
    if (cattle.Precio_venta) {
      setPrecioVenta(cattle.Precio_venta.toString());
    }
  }, [cattle]);

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="id_animal" className="block text-sm font-medium text-gray-700">
            ID del Animal
          </label>
          <input
            type="text"
            id="id_animal"
            name="id_animal"
            defaultValue={cattle.id_animal}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="farm_nombre" className="block text-sm font-medium text-gray-700">
            Nombre de la Finca
          </label>
          <input
            type="text"
            id="farm_nombre"
            name="farm_nombre"
            defaultValue={cattle.farm_nombre}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="peso_entrada" className="block text-sm font-medium text-gray-700">
            Peso de Entrada (kg)
          </label>
          <input
            type="number"
            id="peso_entrada"
            name="peso_entrada"
            step="0.01"
            defaultValue={cattle.peso_entrada}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="precio_kg" className="block text-sm font-medium text-gray-700">
            Precio por Kg (Compra)
          </label>
          <input
            type="number"
            id="precio_kg"
            name="precio_kg"
            step="0.01"
            defaultValue={cattle.precio_kg}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Precio_compra" className="block text-sm font-medium text-gray-700">
            Precio de Compra Total
          </label>
          <input
            type="number"
            id="Precio_compra"
            name="Precio_compra"
            step="0.01"
            defaultValue={cattle.Precio_compra || ''}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="peso_salida" className="block text-sm font-medium text-gray-700">
            Peso de Salida (kg)
          </label>
          <input
            type="number"
            id="peso_salida"
            name="peso_salida"
            step="0.01"
            value={pesoSalida}
            onChange={(e) => setPesoSalida(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="precio_kg_venta" className="block text-sm font-medium text-gray-700">
            Precio por Kg (Venta)
          </label>
          <input
            type="number"
            id="precio_kg_venta"
            name="precio_kg_venta"
            step="0.01"
            value={precioKgVenta}
            onChange={(e) => setPrecioKgVenta(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Precio_venta" className="block text-sm font-medium text-gray-700">
            Precio de Venta Total
          </label>
          <input
            type="number"
            id="Precio_venta"
            name="Precio_venta"
            step="0.01"
            value={precioVenta}
            readOnly
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Calculado automáticamente"
          />
          <p className="mt-1 text-sm text-gray-500">Calculado como: Peso Salida × Precio/kg Venta</p>
        </div>

        <div>
          <label htmlFor="fecha_compra" className="block text-sm font-medium text-gray-700">
            Fecha de Compra
          </label>
          <input
            type="date"
            id="fecha_compra"
            name="fecha_compra"
            defaultValue={cattle.fecha_compra.split('T')[0]}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="fecha_venta" className="block text-sm font-medium text-gray-700">
            Fecha de Venta
          </label>
          <input
            type="date"
            id="fecha_venta"
            name="fecha_venta"
            defaultValue={cattle.fecha_venta ? cattle.fecha_venta.split('T')[0] : ''}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <a href={`/cattle/${cattle.id}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
          Cancelar
        </a>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}