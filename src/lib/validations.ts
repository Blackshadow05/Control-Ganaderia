import { z } from 'zod';

// Schema for cattle (Ganado table) - Updated for Appwrite exact field types
export const cattleSchema = z.object({
  id: z.string().optional(), // Changed to string for Appwrite $id
  id_animal: z.string().min(1, 'ID del animal es requerido'),
  peso_entrada: z.number().min(0, 'Peso de entrada debe ser positivo'), // Integer in Appwrite
  precio_kg: z.number().min(0, 'Precio por kg debe ser positivo'), // Integer (cents) in Appwrite
  Precio_compra: z.string().nullable().optional(), // String in Appwrite
  peso_salida: z.string().nullable().optional(), // String in Appwrite
  precio_kg_venta: z.number().nullable().optional(), // Integer (cents) in Appwrite
  Precio_venta: z.string().nullable().optional(), // String in Appwrite
  farm_nombre: z.string().min(1, 'Nombre de la finca es requerido'),
  farm_id: z.string().nullable().optional(), // String in Appwrite
  fecha_compra: z.string().min(1, 'Fecha de compra es requerida'),
  fecha_venta: z.string().nullable().optional(),
  Imagen: z.string().nullable().optional(),
});

export type Cattle = z.infer<typeof cattleSchema>;

// Schema for injections/vitamins
export const applicationSchema = z.object({
  id: z.string().optional(),
  cattleId: z.string(),
  type: z.enum(['injection', 'vitamin']),
  product: z.string().min(1, 'Producto es requerido'),
  dosage: z.string().min(1, 'Dosis es requerida'),
  date: z.date(),
  notes: z.string().optional(),
});

export type Application = z.infer<typeof applicationSchema>;

// Schema for Aplicaciones table
export const aplicacionesSchema = z.object({
  Nombre: z.string().min(1, 'Nombre es requerido'),
  Descripcion: z.string().optional(),
  Tipo: z.string().min(1, 'Tipo es requerido'),
});

export type AplicacionesForm = z.infer<typeof aplicacionesSchema>;

// Schema for Finca table
export const fincaSchema = z.object({
  "Nombre-finca": z.string().min(1, 'Nombre de la finca es requerido'),
  "Nombre_apartado": z.string().min(1, 'Nombre del apartado es requerido'),
});

export type FincaForm = z.infer<typeof fincaSchema>;

// Schema for AplicacionesAnimal table
export const aplicacionesAnimalSchema = z.object({
  Producto: z.string().min(1, 'Producto es requerido'),
  Cantidad: z.string().min(1, 'Cantidad es requerida'),
  Motivo: z.string().optional(),
  Id_animal: z.string().min(1, 'ID del animal es requerido'),
  Costo: z.number().min(0, 'Costo debe ser positivo').optional(), // Back to number type
  aplicacion_id: z.string().optional().nullable(), // Changed to string for Appwrite compatibility
  Id_producto: z.string().optional().nullable(),   // Changed to string for Appwrite compatibility
});

export type AplicacionesAnimalForm = z.infer<typeof aplicacionesAnimalSchema>;

// Schema for farm lots
export const lotSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nombre es requerido'),
  location: z.string().min(1, 'Ubicación es requerida'),
  size: z.number().min(0, 'Tamaño debe ser positivo'),
  description: z.string().optional(),
});

export type Lot = z.infer<typeof lotSchema>;
