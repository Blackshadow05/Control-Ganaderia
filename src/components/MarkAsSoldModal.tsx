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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Marcar como Vendido</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="peso_salida" className="block text-sm font-semibold text-gray-700 mb-2">
                Peso de Salida (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="peso_salida"
                  name="peso_salida"
                  value={formData.peso_salida}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="Ej: 450.5"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="precio_kg_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                Precio por Kg (₡)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="precio_kg_venta"
                  name="precio_kg_venta"
                  value={formData.precio_kg_venta}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Ej: 1500.00"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="Precio_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                Precio Total (calculado)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="Precio_venta"
                  name="Precio_venta"
                  value={formData.Precio_venta}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Se calcula automáticamente"
                  required
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 font-medium text-base"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">
                Peso de Salida × Precio por Kg
              </p>
            </div>

            <div>
              <label htmlFor="fecha_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Venta
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="fecha_venta"
                  name="fecha_venta"
                  value={formData.fecha_venta}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Marcar como Vendido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
