-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "agotado",
ADD COLUMN     "descripcionCorta" TEXT,
ADD COLUMN     "disponibilidad" TEXT NOT NULL DEFAULT 'disponible',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "promoEtiqueta" TEXT,
ADD COLUMN     "promoGramosMinimos" INTEGER,
ADD COLUMN     "promoPrecioUnitario" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "fechaEntrega" TEXT,
ADD COLUMN     "medioPago" TEXT,
ADD COLUMN     "tipoEntrega" TEXT NOT NULL DEFAULT 'despacho',
ALTER COLUMN "clienteDireccion" DROP NOT NULL,
ALTER COLUMN "comunaNombre" DROP NOT NULL,
ALTER COLUMN "costoEnvio" DROP NOT NULL;

