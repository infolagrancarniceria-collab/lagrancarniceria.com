-- CreateTable
CREATE TABLE "IngredienteNutricional" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreRotulo" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "notas" TEXT,
    "energiaKcal" DOUBLE PRECISION NOT NULL,
    "proteinasG" DOUBLE PRECISION NOT NULL,
    "grasaTotalG" DOUBLE PRECISION NOT NULL,
    "grasaSatG" DOUBLE PRECISION NOT NULL,
    "grasaMonoG" DOUBLE PRECISION NOT NULL,
    "grasaPoliG" DOUBLE PRECISION NOT NULL,
    "grasaTransG" DOUBLE PRECISION NOT NULL,
    "colesterolMg" DOUBLE PRECISION NOT NULL,
    "hcDispG" DOUBLE PRECISION NOT NULL,
    "azucaresG" DOUBLE PRECISION NOT NULL,
    "sodioMg" DOUBLE PRECISION NOT NULL,
    "adicionaSodio" BOOLEAN NOT NULL DEFAULT false,
    "adicionaAzucares" BOOLEAN NOT NULL DEFAULT false,
    "adicionaGrasas" BOOLEAN NOT NULL DEFAULT false,
    "densidadGMl" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "pesoUnidadG" DOUBLE PRECISION,
    "alergeno" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredienteNutricional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoArtesanal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "kgBase" DOUBLE PRECISION NOT NULL,
    "mermaPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcionG" DOUBLE PRECISION NOT NULL,
    "porcionMedidaCasera" TEXT NOT NULL DEFAULT '1 unidad',
    "vidaUtilDias" INTEGER,
    "almacenamiento" TEXT,
    "instruccionesUso" TEXT,
    "leyendaAdicional" TEXT,
    "etiquetaAnchoCm" DOUBLE PRECISION,
    "etiquetaAltoCm" DOUBLE PRECISION,
    "idPosWeb" INTEGER,
    "publicarEnWeb" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductoArtesanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecetaItem" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "ingredienteId" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,
    "porKgBase" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecetaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteProduccion" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "fechaElaboracion" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "pesoAntesG" DOUBLE PRECISION NOT NULL,
    "pesoFinalG" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoteProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosRotulo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "razonSocial" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "resolucionSanitaria" TEXT NOT NULL,
    "paisOrigen" TEXT NOT NULL DEFAULT 'Chile',
    "contacto" TEXT,

    CONSTRAINT "DatosRotulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredienteNutricional_nombre_key" ON "IngredienteNutricional"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoArtesanal_nombre_key" ON "ProductoArtesanal"("nombre");

-- CreateIndex
CREATE INDEX "RecetaItem_productoId_idx" ON "RecetaItem"("productoId");

-- CreateIndex
CREATE INDEX "LoteProduccion_productoId_idx" ON "LoteProduccion"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "LoteProduccion_productoId_codigo_key" ON "LoteProduccion"("productoId", "codigo");

-- AddForeignKey
ALTER TABLE "RecetaItem" ADD CONSTRAINT "RecetaItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "ProductoArtesanal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetaItem" ADD CONSTRAINT "RecetaItem_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "IngredienteNutricional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "ProductoArtesanal"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Datos iniciales: ingredientes base (USDA FoodData Central SR Legacy, por 100 g).
-- HC disponibles = carbohidratos por diferencia - fibra dietética. Trans sin dato USDA = 0.
INSERT INTO "IngredienteNutricional" ("nombre","nombreRotulo","fuente","notas","energiaKcal","proteinasG","grasaTotalG","grasaSatG","grasaMonoG","grasaPoliG","grasaTransG","colesterolMg","hcDispG","azucaresG","sodioMg","adicionaSodio","adicionaAzucares","adicionaGrasas","densidadGMl","pesoUnidadG","alergeno","actualizadoEn") VALUES
('Cerdo, paleta (carne y grasa), cruda', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 167843)', 'Pork, fresh, shoulder, whole, separable lean and fat, raw. Sin dato USDA para: trans (se usa 0).', 236.0, 17.18, 17.99, 6.24, 8.01, 1.92, 0.0, 71.0, 0.0, 0.0, 65.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cerdo, paleta magra, cruda', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 167845)', 'Pork, fresh, shoulder, whole, separable lean only, raw. Sin dato USDA para: azuc, trans (se usa 0).', 148.0, 19.55, 7.14, 2.47, 3.23, 0.77, 0.0, 67.0, 0.0, 0.0, 76.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cerdo, pierna (carne y grasa), cruda', 'carne de cerdo', 'USDA FoodData Central, SR Legacy (FDC 168222)', 'Pork, fresh, leg (ham), whole, separable lean and fat, raw. Sin dato USDA para: azuc, trans (se usa 0).', 245.0, 17.43, 18.87, 6.54, 8.38, 2.01, 0.0, 73.0, 0.0, 0.0, 47.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cerdo, panceta, cruda', 'panceta de cerdo', 'USDA FoodData Central, SR Legacy (FDC 167812)', 'Pork, fresh, belly, raw. Es un corte (carne con su grasa), no se marca como grasa añadida; cámbialo si la Seremi lo interpreta distinto. Sin dato USDA para: trans (se usa 0).', 518.0, 9.34, 53.01, 19.33, 24.7, 5.65, 0.0, 72.0, 0.0, 0.0, 32.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Tocino / lardo de cerdo (grasa dorsal)', 'grasa de cerdo', 'USDA FoodData Central, SR Legacy (FDC 167811)', 'Pork, fresh, backfat, raw. Marcado como grasa añadida (Anexo 2: grasas de origen animal) — criterio conservador. Sin dato USDA para: trans (se usa 0).', 812.0, 2.92, 88.69, 32.21, 41.95, 10.35, 0.0, 57.0, 0.0, 0.0, 11.0, false, false, true, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Vacuno molido 80/20, crudo', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 174036)', 'Beef, ground, 80% lean meat / 20% fat, raw.', 254.0, 17.17, 20.0, 7.581, 8.848, 0.521, 1.18, 71.0, 0.0, 0.0, 66.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Vacuno molido 85/15, crudo', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 171796)', 'Beef, ground, 85% lean meat / 15% fat, raw.', 215.0, 18.59, 15.0, 5.715, 6.469, 0.433, 0.86, 68.0, 0.0, 0.0, 66.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Vacuno molido 90/10, crudo', 'carne de vacuno', 'USDA FoodData Central, SR Legacy (FDC 174030)', 'Beef, ground, 90% lean meat / 10% fat, raw.', 176.0, 20.0, 10.0, 3.927, 4.194, 0.345, 0.54, 65.0, 0.0, 0.0, 66.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Sal', 'sal', 'USDA FoodData Central, SR Legacy (FDC 173468)', 'Salt, table.', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 38758.0, true, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Ajo fresco', 'ajo', 'USDA FoodData Central, SR Legacy (FDC 169230)', 'Garlic, raw. Peso por diente = 3 g (referencia USDA) — pesar un diente promedio de los que usan y corregir.', 149.0, 6.36, 0.5, 0.089, 0.011, 0.249, 0.0, 0.0, 30.96, 1.0, 17.0, false, false, false, 1, 3, NULL, CURRENT_TIMESTAMP),
('Pimienta negra molida', 'pimienta', 'USDA FoodData Central, SR Legacy (FDC 170931)', 'Spices, pepper, black.', 251.0, 10.39, 3.26, 1.392, 0.739, 0.998, 0.0, 0.0, 38.65, 0.64, 20.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Comino', 'comino', 'USDA FoodData Central, SR Legacy (FDC 170923)', 'Spices, cumin seed. Sin dato USDA para: trans (se usa 0).', 375.0, 17.81, 22.27, 1.535, 14.04, 3.279, 0.0, 0.0, 33.74, 2.25, 168.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Paprika (ají de color)', 'paprika', 'USDA FoodData Central, SR Legacy (FDC 171329)', 'Spices, paprika. Sus azúcares son propios de la especia, no cuentan como azúcar añadida.', 282.0, 14.14, 12.89, 2.14, 1.695, 7.766, 0.0, 0.0, 19.09, 10.34, 68.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Orégano seco', 'orégano', 'USDA FoodData Central, SR Legacy (FDC 171328)', 'Spices, oregano, dried.', 265.0, 9.0, 4.28, 1.551, 0.716, 1.369, 0.0, 0.0, 26.42, 4.09, 25.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Ají / cayena en polvo', 'ají', 'USDA FoodData Central, SR Legacy (FDC 170932)', 'Spices, pepper, red or cayenne. Sin dato USDA para: trans (se usa 0).', 318.0, 12.01, 17.27, 3.26, 2.75, 8.37, 0.0, 0.0, 29.43, 10.34, 30.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cilantro (semilla)', 'cilantro', 'USDA FoodData Central, SR Legacy (FDC 170922)', 'Spices, coriander seed. Sin dato USDA para: azuc, trans (se usa 0).', 298.0, 12.37, 17.77, 0.99, 13.58, 1.75, 0.0, 0.0, 13.09, 0.0, 35.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Cebolla cruda', 'cebolla', 'USDA FoodData Central, SR Legacy (FDC 170000)', 'Onions, raw.', 40.0, 1.1, 0.1, 0.042, 0.013, 0.017, 0.0, 0.0, 7.64, 4.24, 4.0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Azúcar', 'azúcar', 'USDA FoodData Central, SR Legacy (FDC 169655)', 'Sugars, granulated. Sin dato USDA para: trans (se usa 0).', 387.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 99.98, 99.8, 1.0, false, true, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Vino tinto', 'vino tinto', 'USDA FoodData Central, SR Legacy (FDC 173190)', 'Alcoholic beverage, wine, table, red. Densidad 0,99 g/ml.', 85.0, 0.07, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.61, 0.62, 4.0, false, false, false, 0.99, NULL, NULL, CURRENT_TIMESTAMP),
('Vino blanco', 'vino blanco', 'USDA FoodData Central, SR Legacy (FDC 174837)', 'Alcoholic beverage, wine, table, white. Densidad 0,99 g/ml.', 82.0, 0.07, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.6, 0.96, 5.0, false, false, false, 0.99, NULL, NULL, CURRENT_TIMESTAMP),
('Queso mozzarella', 'queso mozzarella', 'USDA FoodData Central, SR Legacy (FDC 170845)', 'Cheese, mozzarella, whole milk. Sin dato USDA para: trans (se usa 0).', 299.0, 22.17, 22.14, 13.9, 6.573, 0.765, 0.0, 79.0, 2.4, 0.0, 486.0, false, false, false, 1, NULL, 'leche', CURRENT_TIMESTAMP),
('Agua', 'agua', 'Composición conocida (sin aporte nutricional)', 'Agua potable.', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Sal de cura', 'sal de cura (sal, nitrito de sodio)', 'Estimado: cloruro de sodio puro (39.300 mg Na/100 g)', 'Sal de cura tipo 2 (mmpp.cl). La página del proveedor no publica % de nitrito ni ficha técnica: se usa el sodio del NaCl puro (cota superior; con nitrito el sodio real es apenas menor). Sin azúcares declarados — CONFIRMAR con el rótulo del envase y ajustar el nombre de rótulo (ej. si trae nitrato).', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39300, true, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP),
('Glutamato monosódico', 'glutamato monosódico', 'Estequiométrico: C5H8NO4Na·H2O → 12,28 % de sodio', 'Aditivo con sodio (Anexo 2). Aporte energético/proteico despreciable a las dosis de uso; se declara 0.', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12280, true, false, false, 1, NULL, NULL, CURRENT_TIMESTAMP);

-- Datos de rotulación general entregados por el negocio.
INSERT INTO "DatosRotulo" ("id","razonSocial","domicilio","resolucionSanitaria","paisOrigen") VALUES
(1, 'Pamela Lizama', 'Juan Bautista Inostroza 7809', 'Resolución Sanitaria N° 1239/2018 - 1659/18 - 087/19. Resolución Exenta N° 2013474698 del 31/12/2020, MINSAL.', 'Chile');

-- Primer producto: Longaniza picante (receta entregada por el negocio,
-- base 20,66 kg de carne; cantidades por kg de carne). Corte de carne,
-- tipo de vino y merma quedan por confirmar en /etiquetado.
INSERT INTO "ProductoArtesanal" ("nombre","kgBase","mermaPct","porcionG","porcionMedidaCasera","actualizadoEn") VALUES
('Longaniza picante', 20.66, 0, 130, '1 unidad', CURRENT_TIMESTAMP);

INSERT INTO "RecetaItem" ("productoId","ingredienteId","cantidad","unidad","porKgBase","orden")
SELECT p."id", i."id", v.cantidad, v.unidad, true, v.orden
FROM (VALUES
  ('Cerdo, paleta (carne y grasa), cruda', 1.0, 'kg', 0),
  ('Sal', 16.0, 'g', 1),
  ('Sal de cura', 2.5, 'g', 2),
  ('Glutamato monosódico', 2.0, 'g', 3),
  ('Ajo fresco', 1.0, 'unidad', 4),
  ('Pimienta negra molida', 3.0, 'g', 5),
  ('Comino', 2.0, 'g', 6),
  ('Paprika (ají de color)', 9.8, 'g', 7),
  ('Agua', 35.0, 'ml', 8),
  ('Vino tinto', 15.0, 'ml', 9)
) AS v(nombre, cantidad, unidad, orden)
JOIN "IngredienteNutricional" i ON i."nombre" = v.nombre
CROSS JOIN "ProductoArtesanal" p
WHERE p."nombre" = 'Longaniza picante';
