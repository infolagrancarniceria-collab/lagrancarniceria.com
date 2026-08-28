-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "idPos" INTEGER NOT NULL,
    "plu" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nombreCorto" TEXT,
    "categoriaNombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,
    "familiaCorte" TEXT,
    "agotado" BOOLEAN NOT NULL DEFAULT false,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comuna" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "costoEnvio" DOUBLE PRECISION NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comuna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorteOpcion" (
    "id" SERIAL NOT NULL,
    "familia" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CorteOpcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteNombre" TEXT NOT NULL,
    "clienteTelefono" TEXT NOT NULL,
    "clienteDireccion" TEXT NOT NULL,
    "comunaNombre" TEXT NOT NULL,
    "costoEnvio" DOUBLE PRECISION NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "comentario" TEXT,
    "entregadoAlPos" BOOLEAN NOT NULL DEFAULT false,
    "entregadoAlPosEn" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_idPos_key" ON "Producto"("idPos");

-- CreateIndex
CREATE UNIQUE INDEX "Comuna_nombre_key" ON "Comuna"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CorteOpcion_familia_nombre_key" ON "CorteOpcion"("familia", "nombre");

