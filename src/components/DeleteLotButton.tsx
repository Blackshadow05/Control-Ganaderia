'use client';

import { useTransition } from 'react';

interface DeleteLotButtonProps {
  lotId: number;
  onDelete: () => Promise<void>;
}

export default function DeleteLotButton({ lotId, onDelete }: DeleteLotButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer.')) {
      startTransition(async () => {
        await onDelete();
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isPending ? 'Eliminando...' : 'Eliminar Lote'}
    </button>
  );
}