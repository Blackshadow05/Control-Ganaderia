'use client';

import { useState } from 'react';
import Link from 'next/link';
import SellCattleModal from './SellCattleModal';

export default function CattlePageHeader() {
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const openSellModal = () => setIsSellModalOpen(true);
  const closeSellModal = () => setIsSellModalOpen(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ganado</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Lista de ganado registrado</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/cattle/new"
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm hover:shadow-md flex-1 sm:flex-none"
          >
            Agregar Ganado
          </Link>
          <button
            onClick={openSellModal}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium shadow-sm hover:shadow-md flex-1 sm:flex-none"
          >
            Vender Ganado
          </button>
        </div>
      </div>

      <SellCattleModal
        isOpen={isSellModalOpen}
        onClose={closeSellModal}
      />
    </>
  );
}
