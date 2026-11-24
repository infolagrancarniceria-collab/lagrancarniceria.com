-- Diseño propio de la cara principal de la etiqueta (Canva) y posición de
-- los campos variables (peso neto, elaboración, vencimiento, lote).
ALTER TABLE "ProductoArtesanal" ADD COLUMN     "disenoFrontalUrl" TEXT;
ALTER TABLE "ProductoArtesanal" ADD COLUMN     "disenoCampos" TEXT;
