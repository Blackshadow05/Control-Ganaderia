'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Ganado } from '@/lib/appwrite';
import CattleSearch from '@/components/CattleSearch';

interface CattleListProps {
  initialCattle: Ganado[];
}

export default function CattleList({ initialCattle }: CattleListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('active');
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

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

  const toggleAnimalSelection = (animalId: string) => {
    const newSelected = new Set(selectedAnimals);
    if (newSelected.has(animalId)) {
      newSelected.delete(animalId);
    } else {
      newSelected.add(animalId);
    }
    setSelectedAnimals(newSelected);
  };

  const selectAllAnimals = () => {
    if (selectedAnimals.size === filteredCattle.length) {
      setSelectedAnimals(new Set());
    } else {
      setSelectedAnimals(new Set(filteredCattle.map(animal => animal.id_animal)));
    }
  };

  const handleBulkApplication = () => {
    if (selectedAnimals.size === 0) {
      alert('Por favor selecciona al menos un animal');
      return;
    }
    const selectedAnimalsData = filteredCattle.filter(animal => selectedAnimals.has(animal.id_animal));
    // Store selected animals in sessionStorage to pass to the bulk application page
    sessionStorage.setItem('selectedAnimals', JSON.stringify(selectedAnimalsData));
    router.push('/cattle/bulk-application');
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedAnimals(new Set());
  };

  return (
    <>
      <CattleSearch onSearch={handleSearch} onStatusFilter={handleStatusFilter} />

      {/* Selection Controls */}
      {selectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedAnimals.size === filteredCattle.length && filteredCattle.length > 0}
                onChange={selectAllAnimals}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-blue-800">
                {selectedAnimals.size} de {filteredCattle.length} seleccionados
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApplication}
                disabled={selectedAnimals.size === 0}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedAnimals.size > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Aplicar a {selectedAnimals.size} animales
              </button>
              <button
                onClick={toggleSelectionMode}
                className="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Mode Toggle */}
      {!selectionMode && (
        <div className="mb-4">
          <button
            onClick={toggleSelectionMode}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Seleccionar varios animales
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectionMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seleccionar
                </th>
              )}
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
              <tr key={item.id_animal} className={`${selectionMode ? 'hover:bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                {selectionMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAnimals.has(item.id_animal)}
                      onChange={() => toggleAnimalSelection(item.id_animal)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/cattle/${item.id_animal}`} className="text-blue-600 hover:text-blue-800">
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
          <div key={item.id_animal} className={`bg-white rounded-xl border border-gray-100 ${selectionMode ? 'hover:shadow-md' : 'hover:border-blue-200 hover:shadow-md'} transition-all duration-200`}>
            <div className={`p-4 ${selectionMode ? '' : 'cursor-pointer'}`} onClick={() => {
              if (selectionMode) {
                toggleAnimalSelection(item.id_animal)
              } else {
                router.push(`/cattle/${item.id_animal}`)
              }
            }}>
              {selectionMode && (
                <div className="mb-3">
                  <input
                    type="checkbox"
                    checked={selectedAnimals.has(item.id_animal)}
                    onChange={() => toggleAnimalSelection(item.id_animal)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Seleccionar</span>
                </div>
              )}
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
            </div>
          </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
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
          <Link href="/cattle/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
            Agregar Primer Ganado
          </Link>
        </div>
      )}
    </>
  );
}
