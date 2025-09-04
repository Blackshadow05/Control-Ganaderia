'use client';

import { useState, useEffect } from 'react';

interface CattleSearchProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilter: (status: 'all' | 'active' | 'sold') => void;
}

export default function CattleSearch({ onSearch, onStatusFilter }: CattleSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('active');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Update status filter
  useEffect(() => {
    onStatusFilter(statusFilter);
  }, [statusFilter, onStatusFilter]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm.trim().length > 0;

  const getStatusLabel = (status: 'all' | 'active' | 'sold') => {
    switch (status) {
      case 'all': return 'Todos';
      case 'active': return 'Activos';
      case 'sold': return 'Vendidos';
    }
  };

  const getStatusColor = (status: 'all' | 'active' | 'sold') => {
    switch (status) {
      case 'all': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
      {/* Mobile Compact Header */}
      <div className="md:hidden mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Buscar Ganado</h2>
        
        {/* Mobile Status Filter */}
        <div className="flex items-center space-x-2 mb-3">
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'sold')}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-0 ${getStatusColor(statusFilter)}`}
          >
            <option value="active">Activos</option>
            <option value="sold">Vendidos</option>
            <option value="all">Todos</option>
          </select>
        </div>

        {/* Mobile Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID o finca..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          {hasSearchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Buscar Ganado</h2>
        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'sold')}
              className={`px-3 py-1 text-sm font-medium rounded-full border-0 ${getStatusColor(statusFilter)}`}
            >
              <option value="active">Activos</option>
              <option value="sold">Vendidos</option>
              <option value="all">Todos</option>
            </select>
          </div>

          {hasSearchTerm && (
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      </div>

      {/* Desktop Search Input */}
      <div className="hidden md:block relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID del animal o nombre de finca..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
      </div>

      {(hasSearchTerm || statusFilter !== 'active') && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Filtros activos:</span>
          {statusFilter !== 'active' && (
            <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(statusFilter)}`}>
              Estado: {getStatusLabel(statusFilter)}
            </span>
          )}
          {hasSearchTerm && (
            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Búsqueda: "{searchTerm.trim()}"
            </span>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>💡 <strong>Consejo:</strong> Puedes buscar por ID del animal (ej: "VACA-001") o por nombre de finca (ej: "Finca Central")</p>
      </div>
    </div>
  );
}
