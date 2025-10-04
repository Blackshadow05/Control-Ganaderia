'use client'

import { useRouter } from 'next/navigation'
import { deleteApplication } from '@/lib/appwrite'

interface DeleteApplicationButtonProps {
  applicationId: string
  onDelete?: () => void
}

export default function DeleteApplicationButton({ applicationId, onDelete }: DeleteApplicationButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await deleteApplication(applicationId)

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el producto')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
    >
      Eliminar
    </button>
  )
}