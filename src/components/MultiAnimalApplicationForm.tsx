'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aplicacionesAnimalSchema, type AplicacionesAnimalForm } from '@/lib/validations'
import { supabase, type Ganado } from '@/lib/supabase'
import { getLocalDate, getMaxDate, isFutureDate } from '@/lib/dateUtils'

interface MultiAnimalApplicationFormProps {
  selectedAnimals: Ganado[]
}

export default function MultiAnimalApplicationForm({ selectedAnimals }: MultiAnimalApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [fechaAplicacion, setFechaAplicacion] = useState<string>(getLocalDate())
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AplicacionesAnimalForm>({
    resolver: zodResolver(aplicacionesAnimalSchema),
  })

  // Watch the selected product
  const watchedProduct = watch('Producto')

  // Set a dummy Id_animal to satisfy validation (we'll override it in onSubmit)
  useEffect(() => {
    setValue('Id_animal', 'bulk-application')
  }, [setValue])

  // Fetch products from Aplicaciones table
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase
          .from('Aplicaciones')
          .select('id, Nombre')
          .not('Nombre', 'is', null)

        if (error) {
          console.error('Error fetching products:', error)
          return
        }

        const productosMap = data.map(item => ({
          id: item.id,
          nombre: item.Nombre
        }))
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
    if (selectedAnimals.length === 0) {
      alert('Error: No se han seleccionado animales')
      return
    }

    // Validate product selection
    if (!data.Producto || data.Producto === '') {
      alert('Error: Debes seleccionar un producto')
      return
    }

    // Validate the application date
    if (isFutureDate(fechaAplicacion)) {
      alert('Error: No se pueden registrar aplicaciones con fechas futuras')
      return
    }

    setIsSubmitting(true)

    try {
      // Find the selected product to get its ID
      const selectedProduct = productos.find(p => p.nombre === data.Producto)
      
      // Process each animal
      const results = await Promise.allSettled(
        selectedAnimals.map(async (animal) => {
          const insertData = {
            created_at: fechaAplicacion,
            Producto: data.Producto,
            Cantidad: data.Cantidad,
            Motivo: data.Motivo || null,
            Id_animal: animal.id.toString(),
            Costo: data.Costo || null,
            aplicacion_id: selectedProduct?.id || null,
            Id_producto: selectedProduct?.id || null,
          };

          const { error } = await supabase
            .from('AplicacionesAnimal')
            .insert(insertData)

          if (error) {
            throw new Error(`Error para animal ID ${animal.id}: ${error.message}`)
          }

          return animal.id.toString()
        })
      )

      // Count successes and failures
      const successful = results.filter(result => result.status === 'fulfilled')
      const failed = results.filter(result => result.status === 'rejected')

      if (failed.length > 0) {
        const errorMessages = failed.map(result =>
          result.status === 'rejected' ? result.reason : ''
        ).join('\n')
        setResultMessage(`Aplicación completada con errores:\n✓ Exitosas: ${successful.length}\n✗ Fallidas: ${failed.length}\n\nErrores:\n${errorMessages}`)
        setShowError(true)
      } else {
        const animalNames = selectedAnimals.map(a => a.id_animal).join(', ')
        setResultMessage(`¡Aplicación exitosa! ${data.Producto} aplicado a ${successful.length} animales (${animalNames})`)
        setShowSuccess(true)
      }

      // Hide notification after 5 seconds and navigate
      setTimeout(() => {
        setShowSuccess(false)
        setShowError(false)
        router.push('/cattle')
      }, 5000)
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado al procesar las aplicaciones')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Éxito!</h3>
                <div className="mt-1 text-sm text-green-700">
                  {resultMessage}
                </div>
                <div className="mt-2 text-xs text-green-600">
                  Redirigiendo en 5 segundos...
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Errores detectados</h3>
                <div className="mt-1 text-sm text-red-700 whitespace-pre-line">
                  {resultMessage}
                </div>
                <div className="mt-2 text-xs text-red-600">
                  Redirigiendo en 5 segundos...
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
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
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Aplicación Múltiple</h1>
        <p className="text-gray-600 mt-1">
          Aplicar el mismo producto a {selectedAnimals.length} animales seleccionados
        </p>
      </div>

      {/* Selected Animals Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-blue-800">Animales Seleccionados</h3>
          <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {selectedAnimals.length} animales
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {selectedAnimals.map((animal) => (
            <div key={animal.id} className="bg-white rounded-lg p-3 border border-blue-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">#{animal.id}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{animal.id_animal}</p>
                  <p className="text-xs text-gray-500 truncate">{animal.farm_nombre}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            Costo por animal
          </label>
          <input
            type="number"
            id="Costo"
            step="0.01"
            {...register('Costo', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Costo en colones por animal (opcional)"
          />
          {errors.Costo && (
            <p className="mt-1 text-sm text-red-600">{errors.Costo.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Se aplicará el mismo costo a cada animal
          </p>
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
            max={getMaxDate()}
          />
          <p className="mt-1 text-sm text-gray-500">
            Fecha en que se realizó la aplicación (zona horaria: Costa Rica)
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/cattle')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !watchedProduct}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              isSubmitting || !watchedProduct
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Aplicando...' : `Aplicar a ${selectedAnimals.length} animales`}
          </button>
        </div>
      </form>
    </div>
  )
}
