'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aplicacionesSchema, type AplicacionesForm } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function NewApplicationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AplicacionesForm>({
    resolver: zodResolver(aplicacionesSchema),
  })

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/applications')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const onSubmit = async (data: AplicacionesForm) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('Aplicaciones')
        .insert({
          created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          Nombre: data.Nombre,
          Descripcion: data.Descripcion || null,
          Tipo: data.Tipo,
        })

      if (error) {
        console.error('Error inserting application:', error)
        alert('Error al guardar la aplicación')
      } else {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Nuevo Producto</CardTitle>
          <CardDescription>Registra un nuevo producto veterinario</CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4 text-center pt-0">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">¡Aplicación guardada exitosamente!</h3>
            <p className="text-green-700 mb-4">El producto veterinario ha sido registrado correctamente.</p>
            <p className="text-sm text-green-600">Redirigiendo a la lista de aplicaciones...</p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="Nombre">Nombre</Label>
                <Input
                  id="Nombre"
                  type="text"
                  placeholder="Ingrese el nombre del producto"
                  {...register('Nombre')}
                />
                {errors.Nombre && (
                  <p className="text-sm text-destructive">{errors.Nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="Tipo">Tipo</Label>
                <Select {...register('Tipo')}>
                  <SelectTrigger id="Tipo">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inyección">Inyección</SelectItem>
                    <SelectItem value="Vitamina">Vitamina</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.Tipo && (
                  <p className="text-sm text-destructive">{errors.Tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="Descripcion">Descripción</Label>
                <Textarea
                  id="Descripcion"
                  placeholder="Descripción opcional del producto"
                  rows={4}
                  {...register('Descripcion')}
                />
                {errors.Descripcion && (
                  <p className="text-sm text-destructive">{errors.Descripcion.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
