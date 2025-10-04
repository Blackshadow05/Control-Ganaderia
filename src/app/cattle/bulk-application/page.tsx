'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Ganado } from '@/lib/appwrite'
import MultiAnimalApplicationForm from '@/components/MultiAnimalApplicationForm'

export default function BulkApplicationPage() {
  const router = useRouter()
  const [selectedAnimals, setSelectedAnimals] = useState<Ganado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get selected animals from sessionStorage
    const stored = sessionStorage.getItem('selectedAnimals')
    if (stored) {
      try {
        const animals = JSON.parse(stored)
        setSelectedAnimals(animals)
      } catch (error) {
        console.error('Error parsing selected animals:', error)
        alert('Error al cargar los animales seleccionados')
        router.push('/cattle')
      }
    } else {
      // If no animals selected, redirect back to cattle list
      alert('No se han seleccionado animales')
      router.push('/cattle')
    }
    setLoading(false)
  }, [router])

  const handleClearSelection = () => {
    sessionStorage.removeItem('selectedAnimals')
    setSelectedAnimals([])
    router.push('/cattle')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando animales seleccionados...</p>
        </div>
      </div>
    )
  }

  if (selectedAnimals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🐄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay animales seleccionados</h2>
          <p className="text-gray-600 mb-4">Por favor selecciona animales desde la lista de ganado.</p>
          <button
            onClick={() => router.push('/cattle')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Ir a lista de ganado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <MultiAnimalApplicationForm selectedAnimals={selectedAnimals} />
    </div>
  )
}