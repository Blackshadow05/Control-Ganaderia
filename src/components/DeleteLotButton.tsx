'use client';

import React, { useState } from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from './ConfirmationModal';

interface DeleteLotButtonProps {
  lotId: string;
}

export default function DeleteLotButton({ lotId }: DeleteLotButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setShowModal(false);
    startTransition(async () => {
      try {
        const response = await fetch(`/lots/${lotId}/delete`, {
          method: 'POST',
        });
        
        if (response.ok) {
          router.refresh();
        } else {
          const errorData = await response.json();
          alert(`❌ Error al eliminar el lote: ${errorData.error || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error('Error al eliminar el lote:', error);
        alert('❌ Error de conexión. Por favor, intenta nuevamente más tarde.');
      }
    });
  };

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={isPending}
        className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
          isPending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? 'Eliminando...' : 'Eliminar Lote'}
      </button>
      
      <ConfirmationModal
        isOpen={showModal}
        title="Eliminar Lote"
        message={`Estás a punto de eliminar permanentemente el lote ID: ${lotId}.\n\nEsta acción es irreversible y eliminará todos los datos asociados:\n• Registros de ganado\n• Aplicaciones y tratamientos\n• Historial de movimiento\n• Toda la información relacionada\n\n¿Estás seguro de que deseas continuar?`}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        isLoading={isPending}
      />
    </>
  );
}