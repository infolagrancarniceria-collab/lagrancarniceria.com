-- Instrucciones de uso, conservación y advertencias de alérgenos de los
-- productos artesanales, y jamón con pierna magra. Solo completa campos
-- vacíos (COALESCE): no pisa lo que ya se haya editado en /etiquetado.

-- Pierna de cerdo solo magra (jamón) — USDA FoodData Central SR Legacy.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Cerdo, pierna magra, cruda', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 168224)', 'Pork, fresh, leg (ham), whole, separable lean only, raw. Sin dato USDA para: trans (se usa 0).', 136.0, 20.48, 5.41, 1.87, 2.44, 0.58, 0.0, 68.0, 0.0, 0.0, 55.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

-- Jamón: solo la parte magra de la pierna.
UPDATE "RecetaItem" ri
SET "ingredienteId" = (SELECT "id" FROM "IngredienteNutricional" WHERE "nombre" = 'Cerdo, pierna magra, cruda')
FROM "ProductoArtesanal" p, "IngredienteNutricional" i
WHERE ri."productoId" = p."id" AND ri."ingredienteId" = i."id"
  AND p."nombre" = 'Jamón pierna' AND i."nombre" = 'Cerdo, pierna (carne y grasa), cruda';

-- Jamón cocido en ahumador: merma supuesta 20 % (si sigue en el 0 inicial).
UPDATE "ProductoArtesanal" SET "mermaPct" = 20 WHERE "nombre" = 'Jamón pierna' AND "mermaPct" = 0;

-- Pastrami y jamón: laminados, listos para consumir, 30 días al vacío.
UPDATE "ProductoArtesanal" SET
  "vidaUtilDias" = COALESCE("vidaUtilDias", 30),
  "almacenamiento" = COALESCE("almacenamiento", 'Mantener refrigerado entre 0 °C y 4 °C. Una vez abierto, consumir dentro de 3 días.'),
  "instruccionesUso" = COALESCE("instruccionesUso", 'Producto cocido y laminado, listo para consumir.')
WHERE "nombre" IN ('Pastrami', 'Jamón pierna');

-- Curados (coppa, lomo curado): listos para consumir.
UPDATE "ProductoArtesanal" SET
  "almacenamiento" = COALESCE("almacenamiento", 'Mantener refrigerado entre 0 °C y 4 °C.'),
  "instruccionesUso" = COALESCE("instruccionesUso", 'Producto curado, listo para consumir.')
WHERE "nombre" IN ('Coppa', 'Lomo curado');

-- Embutidos y hamburguesa crudos: cocinar antes de consumir.
UPDATE "ProductoArtesanal" SET
  "almacenamiento" = COALESCE("almacenamiento", 'Mantener refrigerado entre 0 °C y 4 °C.'),
  "instruccionesUso" = COALESCE("instruccionesUso", 'Producto crudo. Cocinar completamente antes de consumir, hasta que el centro no quede rosado.')
WHERE "nombre" IN ('Longaniza picante', 'Longaniza Picante Mejorada', 'Longaniza picante con vinagre',
  'Longaniza Tradicional Mejorada', 'Longaniza vino tinto', 'Longaniza con damasco turco',
  'Longaniza con ciruela deshidratada', 'Longaniza ciruelas', 'Longaniza con queso',
  'Longaniza manzana nuez', 'Butifarra', 'Hamburguesa 100% vacuno');

UPDATE "ProductoArtesanal" SET
  "almacenamiento" = COALESCE("almacenamiento", 'Mantener refrigerado entre 0 °C y 4 °C.')
WHERE "nombre" = 'Arrollado de huaso';

-- Contacto cruzado (pág. 17 del manual): la longaniza con queso (leche) y
-- la de manzana nuez (nueces) se elaboran en los mismos equipos de molienda
-- y embutido que el resto de los productos molidos.
UPDATE "ProductoArtesanal" SET
  "leyendaAdicional" = COALESCE("leyendaAdicional", 'Puede contener leche y nueces.')
WHERE "nombre" IN ('Longaniza picante', 'Longaniza Picante Mejorada', 'Longaniza picante con vinagre',
  'Longaniza Tradicional Mejorada', 'Longaniza vino tinto', 'Longaniza con damasco turco',
  'Longaniza con ciruela deshidratada', 'Longaniza ciruelas', 'Butifarra',
  'Hamburguesa 100% vacuno', 'Arrollado de huaso');

UPDATE "ProductoArtesanal" SET "leyendaAdicional" = COALESCE("leyendaAdicional", 'Puede contener nueces.')
WHERE "nombre" = 'Longaniza con queso';

UPDATE "ProductoArtesanal" SET "leyendaAdicional" = COALESCE("leyendaAdicional", 'Puede contener leche.')
WHERE "nombre" = 'Longaniza manzana nuez';
