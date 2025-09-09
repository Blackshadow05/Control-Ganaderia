export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ApplicationEditForm from './ApplicationEditForm'

async function getApplication(id: string) {
  const { data, error } = await supabase
    .from('Aplicaciones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching application:', error)
    return null
  }

  return data
}

export default async function EditApplicationPage({ params }: { params: { id: string } }) {
  const application = await getApplication(params.id)

  if (!application) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-1">Modifica los datos del producto veterinario</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ApplicationEditForm application={application} />
      </div>
    </div>
  )
}