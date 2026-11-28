-- Línea de ahumados La Gran Charcutería con el modelo de curado por inmersión.
-- Todo condicionado (WHERE / NOT EXISTS / ON CONFLICT) para no pisar ediciones.

-- 1. Agua por 100 g (USDA SR Legacy, nutriente 255) de los ingredientes cargados.
UPDATE "IngredienteNutricional" SET "aguaG" = 64.02 WHERE "nombre" = 'Cerdo, paleta (carne y grasa), cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 72.63 WHERE "nombre" = 'Cerdo, paleta magra, cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 62.47 WHERE "nombre" = 'Cerdo, pierna (carne y grasa), cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 72.9 WHERE "nombre" = 'Cerdo, pierna magra, cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 36.74 WHERE "nombre" = 'Cerdo, panceta, cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 7.69 WHERE "nombre" = 'Tocino / lardo de cerdo (grasa dorsal)' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 61.87 WHERE "nombre" = 'Vacuno molido 80/20, crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 65.66 WHERE "nombre" = 'Vacuno molido 85/15, crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 69.45 WHERE "nombre" = 'Vacuno molido 90/10, crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 66.92 WHERE "nombre" = 'Cerdo, lomo (carne y grasa), crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 69.18 WHERE "nombre" = 'Cerdo, cogote / paleta alta (carne y grasa), cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 59.07 WHERE "nombre" = 'Vacuno, tapapecho (carne y grasa), crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 63.84 WHERE "nombre" = 'Vacuno, sobrecostilla (carne y grasa), cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 73.09 WHERE "nombre" = 'Vacuno, ganso (carne y grasa), crudo' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 69.7 WHERE "nombre" = 'Cerdo, chuleta de centro (carne y grasa), cruda' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 100 WHERE "nombre" = 'Agua' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 0 WHERE "nombre" = 'Sal' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 0 WHERE "nombre" = 'Sal de cura' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 0 WHERE "nombre" = 'Azúcar' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 0 WHERE "nombre" = 'Glutamato monosódico' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 86.49 WHERE "nombre" = 'Vino tinto' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 86.86 WHERE "nombre" = 'Vino blanco' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 89.0 WHERE "nombre" = 'Vino de manzana (sidra)' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 91.96 WHERE "nombre" = 'Cerveza rubia' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 50.01 WHERE "nombre" = 'Queso mozzarella' AND "aguaG" IS NULL;
UPDATE "IngredienteNutricional" SET "aguaG" = 41.46 WHERE "nombre" = 'Queso gouda' AND "aguaG" IS NULL;

-- 2. Cortes nuevos.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","aguaG","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Cerdo, costillar (carne y grasa), crudo', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 167853)', 'Pork, fresh, spareribs, separable lean and fat, raw. Valores de la parte comestible.', 277, 15.47, 23.4, 7.529, 8.542, 3.953, 0.222, 80, 0, 0, 81, 59.75, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cerdo, pernil (carne y grasa), crudo', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 168226)', 'Pork, fresh, leg (ham), shank half, separable lean and fat, raw. Sin cuero: si el pernil se vende con cuero, la grasa y el colesterol reales son mayores.', 193, 19.87, 11.96, 3.942, 5.067, 2.412, 0.095, 67, 0, 0, 84, 67.69, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

-- 3. Nombres comerciales (nombre de fantasía + denominación del alimento).
UPDATE "ProductoArtesanal" SET "nombre" = 'La Clásica – Chuleta de cerdo ahumada' WHERE "nombre" = 'Chuleta ahumada' AND NOT EXISTS (SELECT 1 FROM "ProductoArtesanal" WHERE "nombre" = 'La Clásica – Chuleta de cerdo ahumada');
UPDATE "ProductoArtesanal" SET "nombre" = 'El Protagonista – Pastrami de vacuno ahumado' WHERE "nombre" = 'Pastrami' AND NOT EXISTS (SELECT 1 FROM "ProductoArtesanal" WHERE "nombre" = 'El Protagonista – Pastrami de vacuno ahumado');
UPDATE "ProductoArtesanal" SET "nombre" = 'El Anfitrión – Jamón de pierna ahumado' WHERE "nombre" = 'Jamón pierna' AND NOT EXISTS (SELECT 1 FROM "ProductoArtesanal" WHERE "nombre" = 'El Anfitrión – Jamón de pierna ahumado');

-- 4. Productos nuevos de la línea.
INSERT INTO "ProductoArtesanal" ("nombre","kgBase","mermaPct","porcionG","porcionMedidaCasera","vidaUtilDias","almacenamiento","instruccionesUso","actualizadoEn") VALUES
('El Hincha – Costillar de cerdo ahumado', 9, 0, 150, '1 porción', 30, 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.', 'Producto cocido, listo para consumir.', CURRENT_TIMESTAMP),
('El Elegante – Lomo de cerdo ahumado', 9, 0, 30, '3 láminas', 30, 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.', 'Producto cocido, listo para consumir.', CURRENT_TIMESTAMP),
('El Encendido – Pernil de cerdo ahumado', 9, 0, 150, '1 porción', 30, 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.', 'Producto cocido, listo para consumir.', CURRENT_TIMESTAMP),
('El Sereno – Pernil de cerdo ahumado', 9, 0, 150, '1 porción', 30, 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.', 'Producto cocido, listo para consumir.', CURRENT_TIMESTAMP),
('El Infaltable – Tocino ahumado', 9, 0, 30, '2 lonjas', 30, 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.', 'Cocinar antes de consumir (a la plancha, frito o al horno).', CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", 1, 'kg', true, false, 0
FROM (VALUES ('El Hincha – Costillar de cerdo ahumado', 'Cerdo, costillar (carne y grasa), crudo'), ('El Elegante – Lomo de cerdo ahumado', 'Cerdo, lomo (carne y grasa), crudo'), ('El Encendido – Pernil de cerdo ahumado', 'Cerdo, pernil (carne y grasa), crudo'), ('El Sereno – Pernil de cerdo ahumado', 'Cerdo, pernil (carne y grasa), crudo'), ('El Infaltable – Tocino ahumado', 'Cerdo, panceta, cruda')) AS v(producto, corte)
JOIN "ProductoArtesanal" p ON p."nombre" = v.producto
JOIN "IngredienteNutricional" i ON i."nombre" = v.corte
WHERE NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id");

-- 5. Salmuera única de la tanda (por litro): 55 g sal, 3 g sal de cura, 22 g azúcar.
DELETE FROM "RecetaItem" ri USING "ProductoArtesanal" p WHERE ri."productoId" = p."id" AND ri."enSalmuera" AND p."nombre" IN ('El Hincha – Costillar de cerdo ahumado', 'El Elegante – Lomo de cerdo ahumado', 'El Encendido – Pernil de cerdo ahumado', 'El Sereno – Pernil de cerdo ahumado', 'El Infaltable – Tocino ahumado', 'La Clásica – Chuleta de cerdo ahumada', 'El Protagonista – Pastrami de vacuno ahumado', 'El Anfitrión – Jamón de pierna ahumado') AND NOT p."curadoActivo";
INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","enSalmuera","orden")
SELECT p."id", i."id", v.cantidad, v.unidad, false, true, 100 + v.orden
FROM (VALUES ('Agua', 1000.0, 'ml', 1), ('Sal', 55.0, 'g', 2), ('Azúcar', 22.0, 'g', 3), ('Sal de cura', 3.0, 'g', 4)) AS v(ingrediente, cantidad, unidad, orden)
CROSS JOIN "ProductoArtesanal" p JOIN "IngredienteNutricional" i ON i."nombre" = v.ingrediente
WHERE p."nombre" IN ('El Hincha – Costillar de cerdo ahumado', 'El Elegante – Lomo de cerdo ahumado', 'El Encendido – Pernil de cerdo ahumado', 'El Sereno – Pernil de cerdo ahumado', 'El Infaltable – Tocino ahumado', 'La Clásica – Chuleta de cerdo ahumada', 'El Protagonista – Pastrami de vacuno ahumado', 'El Anfitrión – Jamón de pierna ahumado') AND NOT p."curadoActivo"
  AND NOT EXISTS (SELECT 1 FROM "RecetaItem" ri WHERE ri."productoId" = p."id" AND ri."enSalmuera");

-- 6. Parámetros del modelo de inmersión (tanda: 20 L de salmuera nueva por
--    tanda y ~9 kg de carne). Primero inmersión (3 días) y después inyección
--    (10 %) en todos salvo el pernil. Pastrami de ganso de vacuno, sin cocción
--    posterior al ahumado. Sal de cura nitrada.
--    Fracción de equilibrio según grosor, merma y goteo de grasa: rangos provisorios.
UPDATE "ProductoArtesanal" p SET "curadoActivo" = true, "tandaLitros" = 20, "tandaKgCarne" = 9,
  "fraccionEqMin" = v.fmin, "fraccionEqMax" = v.fmax, "inyeccion" = v.iny, "inyeccionPct" = 10, "enjuaguePct" = 5,
  "factorAzucarMin" = 0.5, "factorAzucarMax" = 0.7, "mermaMinPct" = v.mmin, "mermaMaxPct" = v.mmax,
  "mermaPct" = v.mcen, "mermaGrasaPct" = v.mgra, "huesoPct" = v.hueso, "supuestos" = v.sup
FROM (VALUES
  ('La Clásica – Chuleta de cerdo ahumada', 0.7, 0.9, 'si', 15, 25, 20, 0, 5, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "supuesto", "porcion": "confirmado", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Hincha – Costillar de cerdo ahumado', 0.5, 0.7, 'si', 20, 30, 25, 15, 25, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "supuesto", "porcion": "supuesto", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Elegante – Lomo de cerdo ahumado', 0.5, 0.7, 'si', 15, 25, 20, 0, 0, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "confirmado", "porcion": "supuesto", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Protagonista – Pastrami de vacuno ahumado', 0.3, 0.5, 'si', 25, 35, 30, 0, 0, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "confirmado", "porcion": "supuesto", "corte": "confirmado", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Anfitrión – Jamón de pierna ahumado', 0.25, 0.4, 'si', 15, 25, 20, 0, 0, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "supuesto", "porcion": "supuesto", "corte": "confirmado", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Encendido – Pernil de cerdo ahumado', 0.25, 0.4, 'no', 20, 30, 25, 5, 20, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "supuesto", "porcion": "supuesto", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Sereno – Pernil de cerdo ahumado', 0.25, 0.4, 'no', 20, 30, 25, 5, 20, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "supuesto", "porcion": "supuesto", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}'),
  ('El Infaltable – Tocino ahumado', 0.7, 0.9, 'si', 10, 15, 12.5, 30, 0, '{"tanda": "confirmado", "salmuera": "confirmado", "fraccionEq": "supuesto", "factorAzucar": "supuesto", "enjuague": "supuesto", "merma": "supuesto", "mermaGrasa": "supuesto", "hueso": "confirmado", "porcion": "supuesto", "corte": "supuesto", "salCura": "confirmado", "inyeccion": "confirmado"}')
) AS v(nombre, fmin, fmax, iny, mmin, mmax, mcen, mgra, hueso, sup)
WHERE p."nombre" = v.nombre AND NOT p."curadoActivo";

-- 7. Sal de cura nitrada (~99,4 % NaCl + ~0,6 % nitrito de sodio):
--    Na = 99,4 × 0,3934 + 0,6 × 0,333 ≈ 39,3 g/100 g (igual al valor cargado).
UPDATE "IngredienteNutricional" SET
  "fuente" = 'Sal nitrada: ~99,4 % NaCl + ~0,6 % nitrito de sodio (estequiométrico)',
  "notas" = 'Sodio = NaCl × 0,3934 + NaNO2 × 0,333 ≈ 39.300 mg/100 g. Tipo de sal de cura confirmado por el negocio: nitrada.'
WHERE "nombre" = 'Sal de cura' AND "fuente" LIKE 'Estimado%';

-- 8. Pernil: se vende con cuero, y la tabla USDA SR Legacy no tiene cuero de
--    cerdo crudo; la composición del corte queda como supuesto (grasa y
--    colesterol reales mayores) hasta tener tabla chilena o laboratorio.
UPDATE "IngredienteNutricional" SET "notas" = 'Pork, fresh, leg (ham), shank half, separable lean and fat, raw. El pernil se vende CON CUERO y esta entrada no lo incluye: la grasa y el colesterol reales son mayores. Reemplazar con la Tabla de Composición de Alimentos de Chile o con análisis de laboratorio.'
WHERE "nombre" = 'Cerdo, pernil (carne y grasa), crudo';
