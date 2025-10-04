'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aplicacionesAnimalSchema, type AplicacionesAnimalForm } from '@/lib/validations'
import { getApplications, createApplicationForAnimal, type Aplicaciones } from '@/lib/appwrite'
import { Button } from '@/components/ui/Button'
import { getLocalDate, getMaxDate, isFutureDate } from '@/lib/dateUtils'

interface NewApplicationFormProps {
  params: Promise<{ id: string }>
}

export default function NewApplicationForm({ params }: NewApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [animalId, setAnimalId] = useState<string>('')
  const [productos, setProductos] = useState<{id: string, nombre: string}[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [fechaAplicacion, setFechaAplicacion] = useState<string>(getLocalDate())

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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push(`/cattle/${animalId}`)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, router, animalId])

  // Fetch products from Aplicaciones table
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getApplications()

        // Store products with their IDs for foreign key reference
        const productosMap = data.map(item => ({
          id: item.$id, // Use Appwrite document ID
          nombre: item.Nombre || ''
        })).filter(item => item.nombre !== '') // Filter out empty names
        
        setProductos(productosMap)
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
      // Validate the application date (no timezone issues, just local date)
      if (isFutureDate(fechaAplicacion)) {
        alert('Error: No se pueden registrar aplicaciones con fechas futuras')
        setIsSubmitting(false)
        return
      }

      // Use the selected application date (local date)
      const applicationDate = fechaAplicacion;

      // Find the selected product to get its ID
      const selectedProduct = productos.find(p => p.nombre === data.Producto)
      
      const insertData = {
        Producto: data.Producto,
        Cantidad: data.Cantidad,
        Motivo: data.Motivo || null,
        Id_animal: animalId,
        Costo: data.Costo || null, // Back to number type
        aplicacion_id: selectedProduct?.id || null, // Foreign key reference (string)
        Id_producto: selectedProduct?.id || null,  // Product ID for trigger (string)
      };

      await createApplicationForAnimal(insertData)
      setSuccess(true)
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

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">¡Aplicación guardada exitosamente!</h3>
          <p className="text-green-600 mb-4">La aplicación para el animal ha sido registrada correctamente.</p>
          <p className="text-sm text-green-600">Redirigiendo a los detalles del animal...</p>
        </div>
      ) : (
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
              {!loadingProductos && productos.map((producto) => (
                <option key={producto.id} value={producto.nombre}>
                  {producto.nombre}
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

          <div>
            <label htmlFor="fechaAplicacion" className="block text-sm font-medium text-gray-700">
              Fecha de Aplicación (hora local Costa Rica)
            </label>
            <input
              type="date"
              id="fechaAplicacion"
              value={fechaAplicacion}
              onChange={(e) => setFechaAplicacion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              max={getMaxDate()} // No permite fechas futuras
            />
            <p className="mt-1 text-sm text-gray-500">
              Fecha en que se realizó la aplicación (zona horaria: Costa Rica)
            </p>
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
      )}
    </div>
  )
}
