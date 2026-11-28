-- Modelo de curado por inmersión (equilibrio), hueso y hoja de supuestos.
ALTER TABLE "IngredienteNutricional" ADD COLUMN "aguaG" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "curadoActivo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "tandaLitros" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "tandaKgCarne" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "tandaAguaCarnePct" DOUBLE PRECISION NOT NULL DEFAULT 65;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "fraccionEqMin" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "fraccionEqMax" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "factorAzucarMin" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "factorAzucarMax" DOUBLE PRECISION NOT NULL DEFAULT 0.7;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "enjuaguePct" DOUBLE PRECISION NOT NULL DEFAULT 5;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "inyeccion" TEXT NOT NULL DEFAULT 'no';
ALTER TABLE "ProductoArtesanal" ADD COLUMN "inyeccionPct" DOUBLE PRECISION NOT NULL DEFAULT 10;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "mermaMinPct" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "mermaMaxPct" DOUBLE PRECISION;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "mermaGrasaPct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "huesoPct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "tablaConHueso" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductoArtesanal" ADD COLUMN "supuestos" TEXT;
