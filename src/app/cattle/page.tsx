import Link from 'next/link';
import { getCattle, type Ganado } from '@/lib/appwrite';
import CattleList from '@/components/CattleList';
import CattlePageHeader from '@/components/CattlePageHeader';

// Fetch cattle data from Appwrite - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CattlePage() {
  const cattle = await getCattle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CattlePageHeader />

      <CattleList initialCattle={cattle} />
    </div>
  );
}
