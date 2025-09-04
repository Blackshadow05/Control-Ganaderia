'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fincaSchema, type FincaForm } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function NewLotPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FincaForm>({
    resolver: zodResolver(fincaSchema),
  })

  const onSubmit = async (data: FincaForm) => {
    setIsSubmitting(true)
    try {
      // First, let's test if we can read from the table
      const { data: testData, error: testError } = await supabase
        .from('Finca')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('Error reading from Finca table:', testError)
        alert(`Error de conexión: ${testError.message}`)
        return
      }

      // Now try to insert
      const { error } = await supabase
        .from('Finca')
        .insert({
          created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          "Nombre-finca": data["Nombre-finca"],
          "Nombre_apartado": data["Nombre_apartado"],
        })

      if (error) {
        console.error('Error inserting lot:', error)
        alert(`Error al guardar el lote: ${error.message}`)
      } else {
        router.push('/lots')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Lote</h1>
        <p className="text-gray-600 mt-1">Registra un nuevo lote de la finca</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="Nombre-finca" className="block text-sm font-medium text-gray-700">
            Nombre de la Finca
          </label>
          <input
            type="text"
            id="Nombre-finca"
            {...register('Nombre-finca')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors['Nombre-finca'] && (
            <p className="mt-1 text-sm text-red-600">{errors['Nombre-finca'].message}</p>
          )}
        </div>

        <div>
          <label htmlFor="Nombre_apartado" className="block text-sm font-medium text-gray-700">
            Nombre del Apartado
          </label>
          <input
            type="text"
            id="Nombre_apartado"
            {...register('Nombre_apartado')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors['Nombre_apartado'] && (
            <p className="mt-1 text-sm text-red-600">{errors['Nombre_apartado'].message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Lote'}
          </Button>
        </div>
      </form>
    </div>
  )
}