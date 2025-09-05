'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aplicacionesAnimalSchema, type AplicacionesAnimalForm } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

interface NewApplicationFormProps {
  params: Promise<{ id: string }>
}

export default function NewApplicationForm({ params }: NewApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [animalId, setAnimalId] = useState<string>('')
  const [productos, setProductos] = useState<string[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)

  // Get the animal ID from params
  useEffect(() => {
    params.then((p) => {
      setAnimalId(p.id)
    })
  }, [params])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AplicacionesAnimalForm>({
    resolver: zodResolver(aplicacionesAnimalSchema),
  })

  // Watch the selected product
  const watchedProduct = watch('Producto')

  // Set the animal ID when it becomes available
  useEffect(() => {
    if (animalId) {
      setValue('Id_animal', animalId)
    }
  }, [animalId, setValue])

  // Fetch products from Aplicaciones table
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase
          .from('Aplicaciones')
          .select('Nombre')
          .not('Nombre', 'is', null)

        if (error) {
          console.error('Error fetching products:', error)
          return
        }

        // Get unique product names
        const uniqueProductos = [...new Set(data.map(item => item.Nombre).filter(Boolean))]
        setProductos(uniqueProductos)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoadingProductos(false)
      }
    }

    fetchProductos()
  }, [])

  const onSubmit = async (data: AplicacionesAnimalForm) => {
    if (!animalId) {
      alert('Error: ID del animal no disponible')
      return
    }

    // Validate product selection
    if (!data.Producto || data.Producto === '') {
      alert('Error: Debes seleccionar un producto')
      return
    }

    setIsSubmitting(true)
    try {
      // First, let's test if we can read from the table
      const { data: testData, error: testError } = await supabase
        .from('AplicacionesAnimal')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('Table test failed:', testError)
        alert(`La tabla 'AplicacionesAnimal' no existe o no tienes permisos. Error: ${testError.message}`)
        return
      }

      console.log('Test data read successfully:', testData)

      // Get local date in YYYY-MM-DD format
      const localDate = new Date().toLocaleDateString('en-CA'); // Canadian English gives YYYY-MM-DD format

      const insertData = {
        created_at: localDate,
        Producto: data.Producto,
        Cantidad: data.Cantidad,
        Motivo: data.Motivo || null,
        Id_animal: animalId,
        Costo: data.Costo || null,
      };

      const { error, data: insertedData } = await supabase
        .from('AplicacionesAnimal')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Error inserting application:', error)
        alert(`Error al guardar la aplicación: ${error.message}`)
      } else {
        alert(`¡Aplicación guardada exitosamente! ID: ${insertedData?.[0]?.id}`)
        router.push(`/cattle/${animalId}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Aplicación</h1>
        <p className="text-gray-600 mt-1">
          Registra una nueva aplicación para este animal
          {animalId && <span className="text-green-600 ml-2">✓ ID: {animalId}</span>}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div>
          <label htmlFor="Producto" className="block text-sm font-medium text-gray-700">
            Producto
          </label>
          <select
            id="Producto"
            {...register('Producto')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loadingProductos}
          >
            <option value="">
              {loadingProductos ? 'Cargando productos...' : 'Selecciona un producto'}
            </option>
            {!loadingProductos && productos.map((producto, index) => (
              <option key={index} value={producto}>
                {producto}
              </option>
            ))}
          </select>
          {errors.Producto && (
            <p className="mt-1 text-sm text-red-600">{errors.Producto.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="Cantidad" className="block text-sm font-medium text-gray-700">
            Cantidad
          </label>
          <input
            type="text"
            id="Cantidad"
            {...register('Cantidad')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Cantidad aplicada"
          />
          {errors.Cantidad && (
            <p className="mt-1 text-sm text-red-600">{errors.Cantidad.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="Costo" className="block text-sm font-medium text-gray-700">
            Costo
          </label>
          <input
            type="number"
            id="Costo"
            step="0.01"
            {...register('Costo', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Costo en colones (opcional)"
          />
          {errors.Costo && (
            <p className="mt-1 text-sm text-red-600">{errors.Costo.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="Motivo" className="block text-sm font-medium text-gray-700">
            Motivo
          </label>
          <textarea
            id="Motivo"
            rows={3}
            {...register('Motivo')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Motivo de la aplicación (opcional)"
          />
          {errors.Motivo && (
            <p className="mt-1 text-sm text-red-600">{errors.Motivo.message}</p>
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
          <Button
            type="submit"
            disabled={isSubmitting || !animalId || !watchedProduct}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Aplicación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
