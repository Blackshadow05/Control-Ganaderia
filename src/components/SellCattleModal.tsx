'use client';

import { useState, useEffect } from 'react';
import { supabase, type Ganado } from '@/lib/supabase';
import { getLocalDate } from '@/lib/dateUtils';

interface SellCattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellCattleModal({ isOpen, onClose }: SellCattleModalProps) {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [activeCattle, setActiveCattle] = useState<Ganado[]>([]);
  const [selectedCattle, setSelectedCattle] = useState<Ganado | null>(null);
  const [formData, setFormData] = useState({
    peso_salida: '',
    precio_kg_venta: '',
    Precio_venta: '',
    fecha_venta: getLocalDate()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch active cattle
  useEffect(() => {
    if (isOpen && step === 'select') {
      fetchActiveCattle();
    }
  }, [isOpen, step]);

  const fetchActiveCattle = async () => {
    const { data, error } = await supabase
      .from('Ganado')
      .select('*')
      .is('fecha_venta', null)
      .order('fecha_compra', { ascending: false });

    if (error) {
      console.error('Error fetching active cattle:', error);
      setError('Error al cargar animales activos');
      return;
    }

    setActiveCattle(data || []);
  };

  // Calculate total price automatically
  const calculateTotalPrice = (peso: string, precioKg: string): string => {
    const pesoNum = parseFloat(peso);
    const precioKgNum = parseFloat(precioKg);
    if (!isNaN(pesoNum) && !isNaN(precioKgNum) && pesoNum > 0 && precioKgNum > 0) {
      return (pesoNum * precioKgNum).toFixed(2);
    }
    return '';
  };

  const handleSelectCattle = (cattle: Ganado) => {
    setSelectedCattle(cattle);
    setStep('form');
    setError(null);
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedCattle(null);
    setFormData({
      peso_salida: '',
      precio_kg_venta: '',
      Precio_venta: '',
      fecha_venta: getLocalDate()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!selectedCattle) return;

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
        .eq('id', selectedCattle.id);

      if (error) {
        throw error;
      }

      onClose();
      // Reset
      setStep('select');
      setSelectedCattle(null);
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
      
      if (name === 'peso_salida' || name === 'precio_kg_venta') {
        const peso = name === 'peso_salida' ? value : prev.peso_salida;
        const precioKg = name === 'precio_kg_venta' ? value : prev.precio_kg_venta;
        newData.Precio_venta = calculateTotalPrice(peso, precioKg);
      }
      
      return newData;
    });
  };

  const filteredCattle = activeCattle.filter(cattle =>
    cattle.id_animal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cattle.farm_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'select' ? 'Seleccionar Animal para Vender' : `Vender ${selectedCattle?.id_animal}`}
            </h2>
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

          {step === 'select' ? (
            /* Step 1: Select Animal */
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por ID o finca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
                />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredCattle.length > 0 ? (
                  filteredCattle.map((cattle) => (
                    <div
                      key={cattle.id}
                      onClick={() => handleSelectCattle(cattle)}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">{cattle.id_animal}</h3>
                          <p className="text-sm text-gray-600">{cattle.farm_nombre}</p>
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                          Activo
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay animales activos disponibles</p>
                  </div>
                )}
              </div>

              {filteredCattle.length === 0 && activeCattle.length > 0 && (
                <p className="text-xs text-gray-500 text-center">No se encontraron resultados</p>
              )}
            </div>
          ) : (
            /* Step 2: Sell Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={handleBackToSelect}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                ← Seleccionar otro animal
              </button>

              <div>
                <label htmlFor="peso_salida" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  placeholder="Ej: 450.5"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
                />
              </div>

              <div>
                <label htmlFor="precio_kg_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio por Kg (₡)
                </label>
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

              <div>
                <label htmlFor="Precio_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio Total (calculado)
                </label>
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
                <p className="mt-2 text-xs text-gray-500 italic">
                  Peso de Salida × Precio por Kg
                </p>
              </div>

              <div>
                <label htmlFor="fecha_venta" className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Venta
                </label>
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBackToSelect}
                  className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  Atrás
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
          )}

          {/* Close button for select step */}
          {step === 'select' && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
