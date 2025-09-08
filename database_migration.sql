-- Database Migration: Foreign Key Relationship Between Aplicaciones and AplicacionesAnimal
-- Purpose: When a product name changes in Aplicaciones, it automatically updates in AplicacionesAnimal

-- Step 1: Add foreign key column to AplicacionesAnimal
ALTER TABLE "AplicacionesAnimal" 
ADD COLUMN "aplicacion_id" BIGINT;

-- Step 2: Add foreign key constraint with ON UPDATE CASCADE
ALTER TABLE "AplicacionesAnimal" 
ADD CONSTRAINT "fk_aplicaciones_animal_aplicacion" 
FOREIGN KEY ("aplicacion_id") 
REFERENCES "Aplicaciones"("id") 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Step 3: Create index for better performance
CREATE INDEX "idx_aplicaciones_animal_aplicacion_id" 
ON "AplicacionesAnimal"("aplicacion_id");

-- Step 4: Create view that shows current product names
CREATE OR REPLACE VIEW "AplicacionesAnimal_View" AS
SELECT 
  aa."id",
  aa."created_at",
  COALESCE(a."Nombre", aa."Producto") as "Producto", -- Show current name from Aplicaciones, fallback to stored name
  aa."Cantidad",
  aa."Motivo",
  aa."Id_animal",
  aa."Costo",
  aa."aplicacion_id"
FROM "AplicacionesAnimal" aa
LEFT JOIN "Aplicaciones" a ON aa."aplicacion_id" = a."id";

-- Step 5: Populate existing records with foreign key references
UPDATE "AplicacionesAnimal" 
SET "aplicacion_id" = (
  SELECT "id" 
  FROM "Aplicaciones" 
  WHERE "Aplicaciones"."Nombre" = "AplicacionesAnimal"."Producto"
  LIMIT 1
)
WHERE "Producto" IN (SELECT "Nombre" FROM "Aplicaciones");

-- Step 6: Add documentation
COMMENT ON TABLE "AplicacionesAnimal" IS 'Animal applications with foreign key relationship to Aplicaciones table. Product names are automatically updated via the AplicacionesAnimal_View.';
COMMENT ON COLUMN "AplicacionesAnimal"."aplicacion_id" IS 'Foreign key reference to Aplicaciones.id. Enables automatic product name updates.';

-- Step 7: Create helper function for future data migration
CREATE OR REPLACE FUNCTION sync_aplicaciones_animal_product_names()
RETURNS void AS $$
BEGIN
  UPDATE "AplicacionesAnimal" 
  SET "aplicacion_id" = (
    SELECT "id" 
    FROM "Aplicaciones" 
    WHERE "Aplicaciones"."Nombre" = "AplicacionesAnimal"."Producto"
    LIMIT 1
  )
  WHERE "Producto" IN (SELECT "Nombre" FROM "Aplicaciones") 
  AND "aplicacion_id" IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Add Id_producto field to AplicacionesAnimal
ALTER TABLE "AplicacionesAnimal" 
ADD COLUMN "Id_producto" BIGINT;

-- Step 9: Create index for better performance
CREATE INDEX "idx_aplicaciones_animal_id_producto" 
ON "AplicacionesAnimal"("Id_producto");

-- Step 10: Populate Id_producto for existing records
UPDATE "AplicacionesAnimal" 
SET "Id_producto" = (
  SELECT "id" 
  FROM "Aplicaciones" 
  WHERE "Aplicaciones"."Nombre" = "AplicacionesAnimal"."Producto"
  LIMIT 1
)
WHERE "Producto" IN (SELECT "Nombre" FROM "Aplicaciones");

-- Step 11: Create trigger for automatic Producto field updates using Id_producto
CREATE OR REPLACE FUNCTION update_aplicaciones_animal_product_name_by_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When Nombre is updated in Aplicaciones, update Producto in AplicacionesAnimal
  IF NEW."Nombre" IS DISTINCT FROM OLD."Nombre" THEN
    UPDATE "AplicacionesAnimal" 
    SET "Producto" = NEW."Nombre"
    WHERE "Id_producto" = NEW."id";
    
    RAISE NOTICE 'Updated product name from % to % in AplicacionesAnimal for Id_producto = %', 
                 OLD."Nombre", NEW."Nombre", NEW."id";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on Aplicaciones table
DROP TRIGGER IF EXISTS trigger_update_product_names_by_id ON "Aplicaciones";

CREATE TRIGGER trigger_update_product_names_by_id
  AFTER UPDATE OF "Nombre" ON "Aplicaciones"
  FOR EACH ROW
  EXECUTE FUNCTION update_aplicaciones_animal_product_name_by_id();

-- Usage Instructions:
-- 1. Use "AplicacionesAnimal_View" for reading data to get current product names
-- 2. When inserting new records, include "aplicacion_id" and "Id_producto" to link to Aplicaciones
-- 3. Product names in AplicacionesAnimal_View will automatically update when Aplicaciones.Nombre changes
-- 4. The trigger will automatically update the Producto field in AplicacionesAnimal table when Id_producto matches
-- 5. The "created_at" field serves as the application date - no separate "Fecha" field needed
-- 6. Run sync_aplicaciones_animal_product_names() to fix any orphaned records

-- NOTA: El campo "created_at" actúa como la fecha de aplicación, por lo que no se requiere un campo "Fecha" adicional