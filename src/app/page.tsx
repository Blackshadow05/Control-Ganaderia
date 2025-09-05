import Link from 'next/link';
import { supabase } from '@/lib/supabase';

async function getTotalGanado() {
  const { count, error } = await supabase
    .from('Ganado')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total ganado:', error);
    return 0;
  }

  return count || 0;
}

async function getGanadoVendido() {
  const { count, error } = await supabase
    .from('Ganado')
    .select('*', { count: 'exact', head: true })
    .not('fecha_venta', 'is', null);

  if (error) {
    console.error('Error fetching ganado vendido:', error);
    return 0;
  }

  return count || 0;
}

export default async function Dashboard() {
  const totalGanado = await getTotalGanado();
  const ganadoVendido = await getGanadoVendido();

  const stats = [
    { title: 'Total Ganado', value: totalGanado.toString(), icon: '🐄', color: 'bg-blue-500' },
    { title: 'Ganado Vendido', value: ganadoVendido.toString(), icon: '💰', color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Mobile Optimized */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Resumen general de tu ganadería</p>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/cattle"
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 flex items-center space-x-4"
          >
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl text-green-600">🐄</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Gestionar Ganado</h3>
              <p className="text-xs text-gray-500">Agregar, editar o remover ganado</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link
            href="/applications"
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex items-center space-x-4"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl text-blue-600">💉</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Productos</h3>
              <p className="text-xs text-gray-500">Historial de inyecciones y vitaminas</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link
            href="/lots"
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 flex items-center space-x-4"
          >
            <div className="bg-amber-100 p-3 rounded-lg">
              <span className="text-2xl text-amber-600">🌾</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Lotes</h3>
              <p className="text-xs text-gray-500">Gestionar ubicaciones y lotes</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
