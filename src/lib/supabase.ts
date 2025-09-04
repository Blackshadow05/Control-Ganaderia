import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Ganado {
  id: number
  id_animal: string
  peso_entrada: number
  precio_kg: number
  Precio_compra: number | null
  peso_salida: number | null
  precio_kg_venta: number | null
  Precio_venta: number | null
  farm_nombre: string
  fecha_compra: string
  fecha_venta: string | null
  Imagen: string | null
}

export interface Aplicaciones {
  id: number
  created_at: string
  Nombre: string | null
  Descripcion: string | null
  Tipo: string | null
}

export interface Finca {
  id: number
  created_at: string
  "Nombre-finca": string | null
  "Nombre_apartado": string | null
}

export interface AplicacionesAnimal {
  id: number
  created_at: string
  Producto: string | null
  Cantidad: string | null
  Motivo: string | null
  Id_animal: string | null
  Costo: number | null
}
