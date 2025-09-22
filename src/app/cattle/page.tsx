import Link from 'next/link';
import { supabase, type Ganado } from '@/lib/supabase';
import CattleList from '@/components/CattleList';
import CattlePageHeader from '@/components/CattlePageHeader';

// Fetch cattle data from Supabase - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      <CattlePageHeader />

      <CattleList initialCattle={cattle} />
    </div>
  );
}
