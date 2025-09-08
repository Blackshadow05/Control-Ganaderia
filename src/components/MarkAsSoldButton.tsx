'use client';

import { useState } from 'react';
import MarkAsSoldModal from './MarkAsSoldModal';

interface MarkAsSoldButtonProps {
  cattleId: number;
  cattleName: string;
  onSuccess?: () => void;
}

export default function MarkAsSoldButton({ cattleId, cattleName, onSuccess }: MarkAsSoldButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    // Reload the page to show updated data
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
      >
        Vender
      </button>

      <MarkAsSoldModal
        cattleId={cattleId}
        cattleName={cattleName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}