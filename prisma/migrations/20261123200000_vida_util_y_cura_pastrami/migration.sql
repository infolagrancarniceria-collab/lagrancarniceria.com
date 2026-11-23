-- Datos confirmados por el negocio (solo completa o corrige los valores
-- cargados por las migraciones anteriores; no pisa ediciones manuales).

-- Vida útil de 30 días para todos los productos artesanales.
UPDATE "ProductoArtesanal" SET "vidaUtilDias" = 30 WHERE "vidaUtilDias" IS NULL;

-- Arrollado de huaso: se vende cocido, listo para consumir.
UPDATE "ProductoArtesanal" SET
  "instruccionesUso" = COALESCE("instruccionesUso", 'Producto cocido, listo para consumir.'),
  "almacenamiento" = CASE WHEN "almacenamiento" = 'Mantener refrigerado entre 0 °C y 4 °C.'
    THEN 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.'
    ELSE COALESCE("almacenamiento", 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.') END
WHERE "nombre" = 'Arrollado de huaso';

-- Coppa y lomo curado: una vez abiertos, consumir dentro de 3 días.
UPDATE "ProductoArtesanal" SET
  "almacenamiento" = 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.'
WHERE "nombre" IN ('Coppa', 'Lomo curado')
  AND ("almacenamiento" IS NULL OR "almacenamiento" = 'Mantener refrigerado entre 0 °C y 4 °C.');

-- Pastrami: 2 g de sal de cura por litro de salmuera.
INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", 2, 'g', false, true, 3
FROM "ProductoArtesanal" p, "IngredienteNutricional" i
WHERE p."nombre" = 'Pastrami' AND i."nombre" = 'Sal de cura'
  AND NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id" AND ri."ingredienteId" = i."id");
