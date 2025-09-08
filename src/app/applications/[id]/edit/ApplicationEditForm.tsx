'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aplicacionesSchema, type AplicacionesForm } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

interface ApplicationEditFormProps {
  application: {
    id: number
    Nombre: string
    Descripcion: string | null
    Tipo: string
  }
}

export default function ApplicationEditForm({ application }: ApplicationEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AplicacionesForm>({
    resolver: zodResolver(aplicacionesSchema),
    defaultValues: {
      Nombre: application.Nombre,
      Descripcion: application.Descripcion || '',
      Tipo: application.Tipo,
    },
  })

  const onSubmit = async (data: AplicacionesForm) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('Aplicaciones')
        .update({
          Nombre: data.Nombre,
          Descripcion: data.Descripcion || null,
          Tipo: data.Tipo,
        })
        .eq('id', application.id)

      if (error) {
        console.error('Error updating application:', error)
        alert('Error al actualizar la aplicación')
      } else {
        router.push('/applications')
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="Nombre" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          id="Nombre"
          {...register('Nombre')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.Nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.Nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="Tipo" className="block text-sm font-medium text-gray-700">
          Tipo
        </label>
        <select
          id="Tipo"
          {...register('Tipo')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecciona un tipo</option>
          <option value="Inyección">Inyección</option>
          <option value="Vitamina">Vitamina</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.Tipo && (
          <p className="mt-1 text-sm text-red-600">{errors.Tipo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="Descripcion" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="Descripcion"
          rows={4}
          {...register('Descripcion')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Descripción opcional"
        />
        {errors.Descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.Descripcion.message}</p>
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
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}