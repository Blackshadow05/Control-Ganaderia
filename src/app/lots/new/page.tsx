'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fincaSchema, type FincaForm } from '@/lib/validations'
import { createFarm } from '@/lib/appwrite'
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
      await createFarm({
        "Nombre-finca": data["Nombre-finca"],
        "Nombre_apartado": data["Nombre_apartado"],
      })

      router.push('/lots')
    } catch (error) {
      console.error('Error:', error)
      alert(`Error al guardar el lote: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Nuevo Lote</CardTitle>
          <CardDescription>Registra un nuevo lote de la finca</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="Nombre-finca">Nombre de la Finca</Label>
              <Input
                id="Nombre-finca"
                type="text"
                placeholder="Ingrese el nombre de la finca"
                {...register('Nombre-finca')}
              />
              {errors['Nombre-finca'] && (
                <p className="text-sm text-destructive">{errors['Nombre-finca'].message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="Nombre_apartado">Nombre del Apartado</Label>
              <Input
                id="Nombre_apartado"
                type="text"
                placeholder="Ingrese el nombre del apartado"
                {...register('Nombre_apartado')}
              />
              {errors['Nombre_apartado'] && (
                <p className="text-sm text-destructive">{errors['Nombre_apartado'].message}</p>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Lote'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
