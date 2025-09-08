'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface DeleteApplicationButtonProps {
  applicationId: number
  onDelete?: () => void
}

export default function DeleteApplicationButton({ applicationId, onDelete }: DeleteApplicationButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('Aplicaciones')
        .delete()
        .eq('id', applicationId)

      if (error) {
        console.error('Error deleting application:', error)
        alert('Error al eliminar el producto')
      } else {
        if (onDelete) {
          onDelete()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado al eliminar')
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