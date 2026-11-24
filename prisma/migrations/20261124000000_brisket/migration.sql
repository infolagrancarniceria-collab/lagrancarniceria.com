-- Brisket de sobrecostilla: misma salmuera del pastrami (agua, 55 g de sal y
-- 2 g de sal de cura por litro) más especias tostadas (mostaza, cilantro,
-- laurel, pimienta entera y clavo de olor), 3 días en salmuera.
-- Cantidades de especias, absorción, merma y porción son supuestos a
-- confirmar en /etiquetado.

-- Ingredientes nuevos — USDA FoodData Central SR Legacy.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Vacuno, sobrecostilla (carne y grasa), cruda', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 170826)', 'Beef, chuck, short ribs, boneless, separable lean and fat, trimmed to 0" fat, all grades, raw.', 235.0, 17.48, 18.33, 7.979, 9.206, 0.726, 1.207, 75.0, 0.0, 0.0, 78.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Laurel (hoja seca)', 'laurel', 'USDA FoodData Central, SR Legacy (FDC 170917)', 'Spices, bay leaf. Peso por hoja = 0,2 g (referencial; pesar las que usan). Sin dato USDA de azúcares (se usa 0).', 313.0, 7.61, 8.36, 2.28, 1.64, 2.29, 0.0, 0.0, 48.67, 0.0, 23.0, false, false, false, 1, 0.2, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "ProductoArtesanal" ("nombre","kgBase","mermaPct","salmueraAbsorbidaPct","porcionG","porcionMedidaCasera","vidaUtilDias","almacenamiento","instruccionesUso","actualizadoEn") VALUES
('Brisket', 5, 30, 10, 30, '3 láminas', 30,
 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.',
 'Producto cocido, listo para consumir.', CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", v.cantidad, v.unidad, v.por_kg, v.en_salmuera, v.orden
FROM (VALUES
  ('Vacuno, sobrecostilla (carne y grasa), cruda', 1.0, 'kg', true, false, 0),
  ('Agua', 1000.0, 'ml', false, true, 1),
  ('Sal', 55.0, 'g', false, true, 2),
  ('Sal de cura', 2.0, 'g', false, true, 3),
  ('Semilla de mostaza', 3.0, 'g', false, true, 4),
  ('Cilantro (semilla)', 3.0, 'g', false, true, 5),
  ('Pimienta negra molida', 3.0, 'g', false, true, 6),
  ('Laurel (hoja seca)', 2.0, 'unidad', false, true, 7),
  ('Clavo de olor', 1.0, 'g', false, true, 8)
) AS v(ingrediente, cantidad, unidad, por_kg, en_salmuera, orden)
JOIN "ProductoArtesanal" p ON p."nombre" = 'Brisket'
JOIN "IngredienteNutricional" i ON i."nombre" = v.ingrediente
WHERE NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id");
