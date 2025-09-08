'use client'

import { useState } from 'react';
import { updateAllFarmNames } from '@/app/cattle/update-farm-names';

export function UpdateFarmNamesButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!confirm('¿Está seguro de que desea actualizar todos los nombres de fincas? Esta acción actualizará el campo farm_nombre en todos los registros de Ganado basándose en los datos actuales de la tabla Finca.')) {
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const result = await updateAllFarmNames();
      
      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message);
      } else {
        setIsSuccess(false);
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Error inesperado: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Actualizar Nombres de Fincas
      </h3>
      
      <p className="text-gray-600 mb-4">
        Esta herramienta actualiza el campo <strong>farm_nombre</strong> en todos los registros de Ganado 
        basándose en los datos actuales de la tabla Finca. Útil cuando se realizan cambios en los nombres de las fincas.
      </p>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
            "bg-blue-600 text-white hover:bg-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          )}
        >
          {isUpdating ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </span>
          ) : (
            'Actualizar Todos los Nombres'
          )}
        </button>

        {message && (
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm",
            isSuccess 
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          )}>
            {message}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los triggers de la base de datos actualizarán automáticamente 
          los nombres cuando se modifique la tabla Finca en el futuro.
        </p>
      </div>
    </div>
  );
}

// Utility function for class names
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}