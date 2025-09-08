'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocalDate } from '@/lib/dateUtils';

interface MarkAsSoldModalProps {
  cattleId: number;
  cattleName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkAsSoldModal({ cattleId, cattleName, isOpen, onClose, onSuccess }: MarkAsSoldModalProps) {
  const [formData, setFormData] = useState({
    peso_salida: '',
    precio_kg_venta: '',
    Precio_venta: '',
    fecha_venta: getLocalDate()
  });

  // Calculate total price automatically
  const calculateTotalPrice = (peso: string, precioKg: string): string => {
    const pesoNum = parseFloat(peso);
    const precioKgNum = parseFloat(precioKg);
    if (!isNaN(pesoNum) && !isNaN(precioKgNum) && pesoNum > 0 && precioKgNum > 0) {
      return (pesoNum * precioKgNum).toFixed(2);
    }
    return '';
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('Ganado')
        .update({
          peso_salida: parseFloat(formData.peso_salida),
          precio_kg_venta: parseFloat(formData.precio_kg_venta),
          Precio_venta: parseFloat(formData.Precio_venta),
          fecha_venta: formData.fecha_venta
        })
        .eq('id', cattleId);

      if (error) {
        throw error;
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        peso_salida: '',
        precio_kg_venta: '',
        Precio_venta: '',
        fecha_venta: getLocalDate()
      });
    } catch (err) {
      console.error('Error marking cattle as sold:', err);
      setError(err instanceof Error ? err.message : 'Error al marcar como vendido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate total price when peso_salida or precio_kg_venta changes
      if (name === 'peso_salida' || name === 'precio_kg_venta') {
        const peso = name === 'peso_salida' ? value : prev.peso_salida;
        const precioKg = name === 'precio_kg_venta' ? value : prev.precio_kg_venta;
        newData.Precio_venta = calculateTotalPrice(peso, precioKg);
      }
      
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Marcar como Vendido</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="peso_salida" className="block text-sm font-medium text-gray-700">
              Peso de Salida (kg)
            </label>
            <input
              type="number"
              id="peso_salida"
              name="peso_salida"
              value={formData.peso_salida}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="precio_kg_venta" className="block text-sm font-medium text-gray-700">
              Precio por Kg (venta)
            </label>
            <input
              type="number"
              id="precio_kg_venta"
              name="precio_kg_venta"
              value={formData.precio_kg_venta}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="Precio_venta" className="block text-sm font-medium text-gray-700">
              Precio de Venta Total (calculado automáticamente)
            </label>
            <input
              type="number"
              id="Precio_venta"
              name="Precio_venta"
              value={formData.Precio_venta}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se calcula automáticamente multiplicando Peso de Salida × Precio por Kg
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
              value={formData.fecha_venta}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Marcar como Vendido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}