-- Modo salmuera: los ingredientes "en salmuera" definen la composición de
-- la salmuera; al producto entra solo lo absorbido (% del peso de la base).
ALTER TABLE "ProductoArtesanal" ADD COLUMN     "salmueraAbsorbidaPct" DOUBLE PRECISION;
ALTER TABLE "RecetaItem" ADD COLUMN     "enSalmuera" BOOLEAN NOT NULL DEFAULT false;

-- Tapapecho (brisket) para el pastrami — USDA FoodData Central SR Legacy.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Vacuno, tapapecho (carne y grasa), crudo', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 168666)', 'Beef, brisket, flat half, separable lean and fat, trimmed to 1/8" fat, all grades, raw. Sin dato USDA para: trans (se usa 0).', 277.0, 17.94, 22.18, 8.951, 9.498, 0.844, 0.0, 92.0, 0.0, 0.0, 59.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

-- Pastrami y Jamón pierna (respaldo del programa de recetas). La salmuera
-- está "por litro" (1000 ml de agua + sus ingredientes); absorción, merma
-- y porción son supuestos a confirmar.
INSERT INTO "ProductoArtesanal" ("nombre","kgBase","mermaPct","salmueraAbsorbidaPct","porcionG","porcionMedidaCasera","actualizadoEn") VALUES
('Pastrami', 5, 30, 10, 30, '3 láminas', CURRENT_TIMESTAMP),
('Jamón pierna', 5, 0, 10, 30, '2 láminas', CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", v.cantidad, v.unidad, v.por_kg, v.en_salmuera, v.orden
FROM (VALUES
  ('Pastrami', 'Vacuno, tapapecho (carne y grasa), crudo', 1.0, 'kg', true, false, 0),
  ('Pastrami', 'Agua', 1000.0, 'ml', false, true, 1),
  ('Pastrami', 'Sal', 55.0, 'g', false, true, 2),
  ('Pastrami', 'Pimienta negra molida', 3.0, 'g', true, false, 3),
  ('Pastrami', 'Cilantro (semilla)', 3.0, 'g', true, false, 4),
  ('Pastrami', 'Semilla de mostaza', 3.0, 'g', true, false, 5),
  ('Pastrami', 'Hinojo (semilla)', 3.0, 'g', true, false, 6),
  ('Jamón pierna', 'Cerdo, pierna (carne y grasa), cruda', 1.0, 'kg', true, false, 0),
  ('Jamón pierna', 'Agua', 1000.0, 'ml', false, true, 1),
  ('Jamón pierna', 'Sal', 54.0, 'g', false, true, 2),
  ('Jamón pierna', 'Azúcar', 23.0, 'g', false, true, 3),
  ('Jamón pierna', 'Sal de cura', 3.0, 'g', false, true, 4),
  ('Jamón pierna', 'Glutamato monosódico', 3.0, 'g', false, true, 5)
) AS v(producto, ingrediente, cantidad, unidad, por_kg, en_salmuera, orden)
JOIN "ProductoArtesanal" p ON p."nombre" = v.producto
JOIN "IngredienteNutricional" i ON i."nombre" = v.ingrediente
WHERE NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id");
