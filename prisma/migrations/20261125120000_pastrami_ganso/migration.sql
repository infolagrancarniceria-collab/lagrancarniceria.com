-- El pastrami se hace con ganso de vacuno (pieza de referencia: 3,9 kg,
-- 10 % de inyección, 3 días en salmuera, cocido a 72 °C internos), no con
-- tapapecho. Cambia la carne base de la receta.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Vacuno, ganso (carne y grasa), crudo', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 171745)', 'Beef, round, eye of round roast, boneless, separable lean and fat, trimmed to 0" fat, all grades, raw. El ganso es un corte muy magro.', 124.0, 23.27, 3.44, 1.276, 1.482, 0.25, 0.169, 60.0, 0.0, 0.0, 53.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

UPDATE "RecetaItem" ri
SET "ingredienteId" = (SELECT "id" FROM "IngredienteNutricional" WHERE "nombre" = 'Vacuno, ganso (carne y grasa), crudo')
FROM "ProductoArtesanal" p, "IngredienteNutricional" i
WHERE ri."productoId" = p."id" AND ri."ingredienteId" = i."id"
  AND p."nombre" = 'Pastrami' AND i."nombre" = 'Vacuno, tapapecho (carne y grasa), crudo';

-- Base de la receta = la pieza de referencia de 3,9 kg (solo cambia los
-- gramos que muestra el editor; los valores por 100 g no dependen de esto).
UPDATE "ProductoArtesanal" SET "kgBase" = 3.9 WHERE "nombre" = 'Pastrami' AND "kgBase" = 5;
