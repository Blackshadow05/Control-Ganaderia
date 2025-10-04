import { Client, Databases, Query, ID } from 'appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const databases = new Databases(client)

// Database configuration
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
const GANADO_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GANADO_COLLECTION_ID || 'Ganado'

// Database types (migrados desde Supabase) - Updated for Appwrite exact types
export interface Ganado {
  $id: string
  $createdAt: string
  $updatedAt: string
  id_animal: string
  peso_entrada: number // Integer in Appwrite
  precio_kg: number // Integer in Appwrite
  Precio_compra: string | null // String in Appwrite
  peso_salida: string | null // String in Appwrite
  precio_kg_venta: number // Integer in Appwrite
  Precio_venta: string | null // String in Appwrite
  farm_nombre: string
  farm_id: string | null
  fecha_compra: string
  fecha_venta: string | null
  Imagen: string | null
}

export interface Aplicaciones {
  $id: string
  $createdAt: string
  created_at?: string  // Legacy field
  Nombre: string | null
  Descripcion: string | null
  Tipo: string | null
}

export interface Finca {
  $id: string
  $createdAt: string
  created_at?: string  // Legacy field
  "Nombre-finca": string | null
  "Nombre_apartado": string | null
}

export interface AplicacionesAnimal {
  $id: string
  $createdAt: string
  created_at?: string  // Legacy field
  Producto: string | null
  Cantidad: string | null
  Motivo: string | null
  Id_animal: string | null
  Costo: number | null  // Back to number type
  aplicacion_id: string | null  // Changed to string for Appwrite compatibility
  Id_producto: string | null    // Changed to string for Appwrite compatibility
}

// View interface for reading data with current product names
export interface AplicacionesAnimalView {
  $id: string
  created_at?: string  // Legacy field - may not exist in Appwrite
  $createdAt: string  // Appwrite standard field
  Producto: string | null  // This will show the current name from Aplicaciones
  Cantidad: string | null
  Motivo: string | null
  Id_animal: string | null
  Costo: number | null  // Back to number type
  aplicacion_id: string | null  // Changed to string for Appwrite compatibility
}

// Helper functions para interactuar con Appwrite
export async function getCattle(): Promise<Ganado[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      GANADO_COLLECTION_ID,
      [Query.orderDesc('fecha_compra')]
    )

    // Convert values back to proper format for the interface
    return response.documents.map((doc: any) => ({
      ...doc,
      // Convert integer cents back to decimal for display
      precio_kg: doc.precio_kg ? doc.precio_kg / 100 : 0, // Convert from cents to units
      precio_kg_venta: doc.precio_kg_venta ? doc.precio_kg_venta / 100 : 0, // Convert from cents to units

      // Convert strings to numbers for interface compatibility
      Precio_compra: doc.Precio_compra ? parseFloat(doc.Precio_compra) : null,
      peso_salida: doc.peso_salida ? parseFloat(doc.peso_salida) : null,
      Precio_venta: doc.Precio_venta ? parseFloat(doc.Precio_venta) : null,
    })) as Ganado[]
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return []
  }
}

export async function getCattleById(id: string): Promise<Ganado | null> {
  // Decode the URL-encoded ID
  const decodedId = decodeURIComponent(id)

  const convertValues = (doc: any): Ganado => {
    console.log('Converting cattle document:', doc);
    console.log('Image URL from database:', doc.Imagen);
    
    return {
      ...doc,
      // Convert integer cents back to decimal for display
      precio_kg: doc.precio_kg ? doc.precio_kg / 100 : 0, // Convert from cents to units
      precio_kg_venta: doc.precio_kg_venta ? doc.precio_kg_venta / 100 : 0, // Convert from cents to units

      // Convert strings to numbers for interface compatibility
      Precio_compra: doc.Precio_compra ? parseFloat(doc.Precio_compra) : null,
      peso_salida: doc.peso_salida ? parseFloat(doc.peso_salida) : null,
      Precio_venta: doc.Precio_venta ? parseFloat(doc.Precio_venta) : null,
      Imagen: doc.Imagen || null, // Asegurarse de que la URL de la imagen se mantenga como está
    };
  };

  try {
    // First try to get by Appwrite ID (using decoded ID)
    const response = await databases.getDocument(
      DATABASE_ID,
      GANADO_COLLECTION_ID,
      decodedId
    )

    return convertValues(response) as Ganado
  } catch (error) {
    // If that fails, try to get by id_animal field (with both encoded and decoded)
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        GANADO_COLLECTION_ID,
        [Query.equal('id_animal', decodedId)]
      )

      if (response.documents.length > 0) {
        return convertValues(response.documents[0]) as Ganado
      }

      // If not found with decoded ID, try with original encoded ID
      if (decodedId !== id) {
        const encodedResponse = await databases.listDocuments(
          DATABASE_ID,
          GANADO_COLLECTION_ID,
          [Query.equal('id_animal', id)]
        )

        if (encodedResponse.documents.length > 0) {
          return convertValues(encodedResponse.documents[0]) as Ganado
        }
      }

      return null
    } catch (secondError) {
      console.error('Error fetching cattle by ID or id_animal:', secondError)
      return null
    }
  }
}

export async function getApplicationsForAnimal(animalId: string): Promise<AplicacionesAnimalView[]> {
  const decodedAnimalId = decodeURIComponent(animalId)

  try {
    const APLICACIONES_ANIMAL_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONESANIMAL_COLLECTION_ID || 'AplicacionesAnimal'

    const response = await databases.listDocuments(
      DATABASE_ID,
      APLICACIONES_ANIMAL_COLLECTION_ID,
      [Query.equal('Id_animal', decodedAnimalId), Query.orderDesc('$createdAt')]
    )

    return response.documents as unknown as AplicacionesAnimalView[]
  } catch (error) {
    console.error('Error fetching applications for animal:', error)
    return []
  }
}

// Funciones para operaciones CRUD con Appwrite
export async function createCattle(data: Partial<Ganado>) {
  try {
    console.log('Creating cattle with data:', data);
    
    // Convert values to proper format for Appwrite according to field types
    const processedData = {
      ...data,
      // Integer fields
      peso_entrada: typeof data.peso_entrada === 'number' ? Math.round(data.peso_entrada) : Math.round(parseFloat(String(data.peso_entrada))),
      precio_kg: typeof data.precio_kg === 'number' ? Math.round(data.precio_kg * 100) : Math.round(parseFloat(String(data.precio_kg)) * 100), // Convert to cents
      precio_kg_venta: data.precio_kg_venta ? (typeof data.precio_kg_venta === 'number' ? Math.round(data.precio_kg_venta * 100) : Math.round(parseFloat(String(data.precio_kg_venta)) * 100)) : null, // Convert to cents

      // String fields - handle type conversion more carefully
      Precio_compra: data.Precio_compra ? String(data.Precio_compra) : null,
      peso_salida: data.peso_salida ? String(data.peso_salida) : null,
      Precio_venta: data.Precio_venta ? String(data.Precio_venta) : null,
      Imagen: data.Imagen ? String(data.Imagen) : null, // Asegurarse de que la URL de la imagen se guarde como string
    };
    
    console.log('Processed cattle data for Appwrite:', processedData);

    const response = await databases.createDocument(
      DATABASE_ID,
      GANADO_COLLECTION_ID,
      ID.unique(),
      processedData
    )
    return response
  } catch (error) {
    console.error('Error creating cattle:', error)
    throw error
  }
}

export async function updateCattle(id: string, data: Partial<Ganado>) {
  try {
    // First try to get the document to find the correct Appwrite ID
    const cattle = await getCattleById(id)

    if (!cattle) {
      throw new Error('Document with the requested ID could not be found.')
    }

    // Convert values to proper format for Appwrite according to field types (same as createCattle)
    const processedData = {
      ...data,
      // Integer fields
      peso_entrada: typeof data.peso_entrada === 'number' ? Math.round(data.peso_entrada) : Math.round(parseFloat(String(data.peso_entrada))),
      precio_kg: typeof data.precio_kg === 'number' ? Math.round(data.precio_kg * 100) : Math.round(parseFloat(String(data.precio_kg)) * 100), // Convert to cents
      precio_kg_venta: data.precio_kg_venta ? (typeof data.precio_kg_venta === 'number' ? Math.round(data.precio_kg_venta * 100) : Math.round(parseFloat(String(data.precio_kg_venta)) * 100)) : null, // Convert to cents

      // String fields - handle type conversion more carefully
      Precio_compra: data.Precio_compra ? String(data.Precio_compra) : null,
      peso_salida: data.peso_salida ? String(data.peso_salida) : null,
      Precio_venta: data.Precio_venta ? String(data.Precio_venta) : null,
      Imagen: data.Imagen ? String(data.Imagen) : null, // Asegurarse de que la URL de la imagen se guarde como string
    };
    
    console.log('Updating cattle with processed data:', processedData);

    // Use the actual Appwrite document ID ($id) for the update
    const response = await databases.updateDocument(
      DATABASE_ID,
      GANADO_COLLECTION_ID,
      cattle.$id,
      processedData
    )
    return response
  } catch (error) {
    console.error('Error updating cattle:', error)
    throw error
  }
}

export async function deleteCattle(id: string) {
  try {
    // First try to get the document to find the correct Appwrite ID
    const cattle = await getCattleById(id)

    if (!cattle) {
      throw new Error('Document with the requested ID could not be found.')
    }

    // Use the actual Appwrite document ID ($id) for the deletion
    const response = await databases.deleteDocument(
      DATABASE_ID,
      GANADO_COLLECTION_ID,
      cattle.$id
    )
    return response
  } catch (error) {
    console.error('Error deleting cattle:', error)
    throw error
  }
}

export async function getFarmById(id: number): Promise<Finca | null> {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.listDocuments(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      [Query.equal('id', id)]
    )

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Finca
    }
    return null
  } catch (error) {
    console.error('Error fetching farm by ID:', error)
    return null
  }
}

export async function getFarmByAppwriteId(id: string): Promise<Finca | null> {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.getDocument(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      id
    )

    return response as unknown as Finca
  } catch (error) {
    console.error('Error fetching farm by Appwrite ID:', error)
    return null
  }
}

export async function getFarms(): Promise<Finca[]> {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.listDocuments(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    )

    return response.documents as unknown as Finca[]
  } catch (error) {
    console.error('Error fetching farms:', error)
    return []
  }
}

// Funciones CRUD para Finca
export async function createFarm(data: Partial<Finca>) {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.createDocument(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      ID.unique(),
      data
    )
    return response
  } catch (error) {
    console.error('Error creating farm:', error)
    throw error
  }
}

export async function updateFarm(id: string, data: Partial<Finca>) {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.updateDocument(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      id,
      data
    )
    return response
  } catch (error) {
    console.error('Error updating farm:', error)
    throw error
  }
}

export async function deleteFarm(id: string) {
  try {
    const FINCA_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINCA_COLLECTION_ID || 'Finca'

    const response = await databases.deleteDocument(
      DATABASE_ID,
      FINCA_COLLECTION_ID,
      id
    )
    return response
  } catch (error) {
    console.error('Error deleting farm:', error)
    throw error
  }
}

// Funciones para manejar Aplicaciones (productos)
export async function getApplications(): Promise<Aplicaciones[]> {
  try {
    const APLICACIONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONES_COLLECTION_ID || 'Aplicaciones'

    const response = await databases.listDocuments(
      DATABASE_ID,
      APLICACIONES_COLLECTION_ID,
      [Query.orderDesc('Nombre')]
    )

    return response.documents as unknown as Aplicaciones[]
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  }
}

// Función para crear una nueva aplicación (producto)
export async function createApplication(data: Partial<Aplicaciones>) {
  try {
    const APLICACIONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONES_COLLECTION_ID || 'Aplicaciones'

    const response = await databases.createDocument(
      DATABASE_ID,
      APLICACIONES_COLLECTION_ID,
      ID.unique(),
      data
    )
    return response
  } catch (error) {
    console.error('Error creating application:', error)
    throw error
  }
}

// Función para actualizar una aplicación
export async function updateApplication(id: string, data: Partial<Aplicaciones>) {
  try {
    const APLICACIONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONES_COLLECTION_ID || 'Aplicaciones'

    const response = await databases.updateDocument(
      DATABASE_ID,
      APLICACIONES_COLLECTION_ID,
      id,
      data
    )
    return response
  } catch (error) {
    console.error('Error updating application:', error)
    throw error
  }
}

// Función para eliminar una aplicación
export async function deleteApplication(id: string) {
  try {
    const APLICACIONES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONES_COLLECTION_ID || 'Aplicaciones'

    const response = await databases.deleteDocument(
      DATABASE_ID,
      APLICACIONES_COLLECTION_ID,
      id
    )
    return response
  } catch (error) {
    console.error('Error deleting application:', error)
    throw error
  }
}

// Función para crear una aplicación de producto para un animal
export async function createApplicationForAnimal(data: Partial<AplicacionesAnimal>) {
  try {
    const APLICACIONES_ANIMAL_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONESANIMAL_COLLECTION_ID || 'AplicacionesAnimal'

    const response = await databases.createDocument(
      DATABASE_ID,
      APLICACIONES_ANIMAL_COLLECTION_ID,
      ID.unique(),
      data
    )
    return response
  } catch (error) {
    console.error('Error creating application for animal:', error)
    throw error
  }
}

// Función para actualizar una aplicación de animal
export async function updateApplicationForAnimal(id: string, data: Partial<AplicacionesAnimal>) {
  try {
    const APLICACIONES_ANIMAL_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONESANIMAL_COLLECTION_ID || 'AplicacionesAnimal'

    const response = await databases.updateDocument(
      DATABASE_ID,
      APLICACIONES_ANIMAL_COLLECTION_ID,
      id,
      data
    )
    return response
  } catch (error) {
    console.error('Error updating application for animal:', error)
    throw error
  }
}

// Función para eliminar una aplicación de animal
export async function deleteApplicationForAnimal(id: string) {
  try {
    const APLICACIONES_ANIMAL_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONESANIMAL_COLLECTION_ID || 'AplicacionesAnimal'

    const response = await databases.deleteDocument(
      DATABASE_ID,
      APLICACIONES_ANIMAL_COLLECTION_ID,
      id
    )
    return response
  } catch (error) {
    console.error('Error deleting application for animal:', error)
    throw error
  }
}

// Función para obtener una aplicación de animal por ID
export async function getApplicationForAnimalById(id: string): Promise<AplicacionesAnimalView | null> {
  try {
    const APLICACIONES_ANIMAL_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APLICACIONESANIMAL_COLLECTION_ID || 'AplicacionesAnimal'

    const response = await databases.getDocument(
      DATABASE_ID,
      APLICACIONES_ANIMAL_COLLECTION_ID,
      id
    )

    return response as unknown as AplicacionesAnimalView
  } catch (error) {
    console.error('Error fetching application for animal by ID:', error)
    return null
  }
}