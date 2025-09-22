'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DeleteApplicationModalProps {
  applicationId: number;
  applicationName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteApplicationModal({ 
  applicationId, 
  applicationName, 
  isOpen, 
  onClose, 
  onDelete 
}: DeleteApplicationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('AplicacionesAnimal')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('Error deleting application:', error);
        alert('Error al eliminar la aplicación');
      } else {
        onDelete();
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error inesperado al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        <div className="p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">¿Eliminar aplicación?</h3>
          <p className="text-sm text-gray-600 mb-6 text-center">
            ¿Estás seguro de que deseas eliminar la aplicación {'"'}{applicationName}{'"'}? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
