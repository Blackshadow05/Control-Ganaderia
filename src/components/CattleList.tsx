'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { type Ganado } from '@/lib/supabase';
import CattleSearch from '@/components/CattleSearch';

interface CattleListProps {
  initialCattle: Ganado[];
}

export default function CattleList({ initialCattle }: CattleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('active');

  const filteredCattle = useMemo(() => {
    let filtered = initialCattle;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => {
        const isSold = item.fecha_venta !== null;
        return statusFilter === 'sold' ? isSold : !isSold;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const matchesId = item.id_animal.toLowerCase().includes(term);
        const matchesFarm = item.farm_nombre.toLowerCase().includes(term);

        return matchesId || matchesFarm;
      });
    }

    return filtered;
  }, [initialCattle, searchTerm, statusFilter]);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleStatusFilter = (newStatusFilter: 'all' | 'active' | 'sold') => {
    setStatusFilter(newStatusFilter);
  };

  return (
    <>
      <CattleSearch onSearch={handleSearch} onStatusFilter={handleStatusFilter} />

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Finca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCattle.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/cattle/${item.id}`} className="text-blue-600 hover:text-blue-800">
                    {item.id_animal}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.farm_nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.fecha_venta ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.fecha_venta ? 'Vendido' : 'Activo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredCattle.map((item) => (
          <Link 
            key={item.id} 
            href={`/cattle/${item.id}`}
            className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900 text-sm">{item.id_animal}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                item.fecha_venta ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {item.fecha_venta ? 'Vendido' : 'Activo'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Finca:</span> {item.farm_nombre}
            </div>
          </Link>
        ))}
      </div>

      {filteredCattle.length === 0 && initialCattle.length > 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-600 mb-6">
            No hay ganado que coincida con los filtros aplicados.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {initialCattle.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ganado registrado</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer ganado al sistema.</p>
          <Link href="/cattle/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Agregar Primer Ganado
          </Link>
        </div>
      )}
    </>
  );
}
