-- Chuleta ahumada: salmuera por litro (55 g de sal, 22 g de azúcar, 3 g de
-- sal de cura), inyectada ~10 % y además sumergida; se vende cocida, lista
-- para consumir. Absorción (10 %) y merma (20 %) son supuestos a confirmar.

-- Chuleta de centro de cerdo — USDA FoodData Central SR Legacy. Los valores
-- son de la parte comestible (sin hueso).
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Cerdo, chuleta de centro (carne y grasa), cruda', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 168238)', 'Pork, fresh, loin, center loin (chops), bone-in, separable lean and fat, raw. Valores de la parte comestible (sin hueso).', 170.0, 20.71, 9.03, 2.993, 3.548, 1.19, 0.092, 69.0, 0.0, 0.0, 55.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "ProductoArtesanal" ("nombre","kgBase","mermaPct","salmueraAbsorbidaPct","porcionG","porcionMedidaCasera","vidaUtilDias","almacenamiento","instruccionesUso","actualizadoEn") VALUES
('Chuleta ahumada', 5, 20, 10, 160, '1 chuleta', 30,
 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.',
 'Producto cocido, listo para consumir. Se recomienda calentar a baño María en su misma bolsa o con cualquier otro método.',
 CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", v.cantidad, v.unidad, v.por_kg, v.en_salmuera, v.orden
FROM (VALUES
  ('Cerdo, chuleta de centro (carne y grasa), cruda', 1.0, 'kg', true, false, 0),
  ('Agua', 1000.0, 'ml', false, true, 1),
  ('Sal', 55.0, 'g', false, true, 2),
  ('Azúcar', 22.0, 'g', false, true, 3),
  ('Sal de cura', 3.0, 'g', false, true, 4)
) AS v(ingrediente, cantidad, unidad, por_kg, en_salmuera, orden)
JOIN "ProductoArtesanal" p ON p."nombre" = 'Chuleta ahumada'
JOIN "IngredienteNutricional" i ON i."nombre" = v.ingrediente
WHERE NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id");
