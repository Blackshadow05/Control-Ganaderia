import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

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
  farm_nombre: string  // Mantenemos esto por compatibilidad temporal
  farm_id: number | null  // Nueva relación por ID
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
  aplicacion_id: number | null  // Foreign key field
  Id_producto: number | null    // Product ID field for trigger
}

// View interface for reading data with current product names
export interface AplicacionesAnimalView {
  id: number
  created_at: string  // This field serves as the application date
  Producto: string | null  // This will show the current name from Aplicaciones
  Cantidad: string | null
  Motivo: string | null
  Id_animal: string | null
  Costo: number | null
  aplicacion_id: number | null
}
