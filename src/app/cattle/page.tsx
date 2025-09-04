import Link from 'next/link';
import { supabase, type Ganado } from '@/lib/supabase';
import CattleList from '@/components/CattleList';

// Fetch cattle data from Supabase
async function getCattle(): Promise<Ganado[]> {
  const { data, error } = await supabase
    .from('Ganado')
    .select('*')
    .order('fecha_compra', { ascending: false });

  if (error) {
    console.error('Error fetching cattle:', error);
    return [];
  }

  return data || [];
}

export default async function CattlePage() {
  const cattle = await getCattle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ganado</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Lista de ganado registrado</p>
        </div>
        <Link 
          href="/cattle/new" 
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm hover:shadow-md"
        >
          Agregar Ganado
        </Link>
      </div>

      <CattleList initialCattle={cattle} />
    </div>
  );
}
