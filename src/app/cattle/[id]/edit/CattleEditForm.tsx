'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Ganado, type Finca } from '@/lib/appwrite';
import { formatDateDisplay } from '@/lib/formatDateLocal';

interface CattleEditFormProps {
  cattle: Ganado;
  fincas: Finca[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function CattleEditForm({ cattle, fincas, onSubmit }: CattleEditFormProps) {
  const [farmId, setFarmId] = useState('');
  const [pesoEntrada, setPesoEntrada] = useState('');
  const [precioKg, setPrecioKg] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [pesoSalida, setPesoSalida] = useState('');
  const [precioKgVenta, setPrecioKgVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  
  // Log para debuggear
  console.log('Cattle data:', cattle);
  console.log('Fincas disponibles:', fincas);
  console.log('farm_id actual:', cattle.farm_id);

  // Calculate Precio_compra when peso_entrada or precio_kg changes
  useEffect(() => {
    if (pesoEntrada && precioKg) {
      const calculated = parseFloat(pesoEntrada) * parseFloat(precioKg);
      setPrecioCompra(calculated.toFixed(2));
    } else {
      setPrecioCompra('');
    }
  }, [pesoEntrada, precioKg]);

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
    if (cattle.farm_id) {
      setFarmId(cattle.farm_id.toString());
    }
    if (cattle.peso_entrada) {
      setPesoEntrada(cattle.peso_entrada.toString());
    }
    if (cattle.precio_kg) {
      setPrecioKg(cattle.precio_kg.toString());
    }
    if (cattle.Precio_compra) {
      setPrecioCompra(cattle.Precio_compra.toString());
    }
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
      {/* Campo oculto para Imagen */}
      <input
        type="hidden"
        name="Imagen"
        value={cattle.Imagen || ''}
      />
      
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
          <label htmlFor="farm_id" className="block text-sm font-medium text-gray-700">
            Ubicación - Finca
          </label>
          <select
            id="farm_id"
            name="farm_id"
            required
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona una finca y apartado</option>
            {fincas.map((finca) => (
              <option key={finca.$id} value={finca.$id}>
                {`${finca["Nombre-finca"] || ''} - ${finca["Nombre_apartado"] || ''}`}
              </option>
            ))}
          </select>
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
            value={pesoEntrada}
            onChange={(e) => setPesoEntrada(e.target.value)}
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
            value={precioKg}
            onChange={(e) => setPrecioKg(e.target.value)}
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
            value={precioCompra}
            readOnly
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Calculado automáticamente"
          />
          <p className="mt-1 text-sm text-gray-500">Calculado como: Peso Entrada × Precio/kg Compra</p>
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
          <p className="mt-1 text-sm text-gray-500">
            Fecha actual registrada: {formatDateDisplay(cattle.fecha_compra)}
          </p>
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
          {cattle.fecha_venta && (
            <p className="mt-1 text-sm text-gray-500">
              Fecha actual registrada: {formatDateDisplay(cattle.fecha_venta)}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Link href={`/cattle/${cattle.id}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
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
  );
}
