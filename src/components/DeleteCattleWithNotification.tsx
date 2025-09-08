'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCattleWithResult } from '@/app/cattle/actions'

interface DeleteCattleWithNotificationProps {
  cattleId: number
  cattleName: string
}

export default function DeleteCattleWithNotification({ cattleId, cattleName }: DeleteCattleWithNotificationProps) {
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el ganado ${cattleName}?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await deleteCattleWithResult(cattleId)
      
      if (result.success) {
        // Show success message before redirect
        setNotificationMessage(`¡Ganado ${cattleName} eliminado exitosamente! Redirigiendo...`)
        setNotificationType('success')
        setShowNotification(true)
        
        // Hide notification and then redirect after 2 seconds
        setTimeout(() => {
          setShowNotification(false)
          router.push('/cattle')
        }, 2000)
      } else {
        throw new Error(result.message || 'Error desconocido al eliminar')
      }
    } catch (error) {
      console.error('Error:', error)
      setNotificationMessage('Error al eliminar el ganado. Inténtalo de nuevo.')
      setNotificationType('error')
      setShowNotification(true)
      // Hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Success/Error Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`border rounded-lg p-4 shadow-lg max-w-md ${
            notificationType === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notificationType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  notificationType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notificationType === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <div className={`mt-1 text-sm ${
                  notificationType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notificationMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isDeleting ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isDeleting ? 'Eliminando...' : 'Eliminar Ganado'}
      </button>
    </>
  )
}