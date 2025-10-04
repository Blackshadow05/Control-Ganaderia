export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation'
import { getApplications, type Aplicaciones } from '@/lib/appwrite'
import ApplicationEditForm from './ApplicationEditForm'

async function getApplication(id: string) {
  try {
    const applications = await getApplications()
    return applications.find(app => app.$id === id) || null
  } catch (error) {
    console.error('Error fetching application:', error)
    return null
  }
}

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getApplication(id)

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