-- CreateEnum
CREATE TYPE "EstadoProduccion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "productos" ADD COLUMN "stockActual" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "stockMinimo" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ordenes_produccion" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" "EstadoProduccion" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_produccion_numero_key" ON "ordenes_produccion"("numero");

-- CreateIndex
CREATE INDEX "ordenes_produccion_productoId_idx" ON "ordenes_produccion"("productoId");

-- CreateIndex
CREATE INDEX "ordenes_produccion_estado_idx" ON "ordenes_produccion"("estado");

-- CreateIndex
CREATE INDEX "ordenes_produccion_createdAt_idx" ON "ordenes_produccion"("createdAt");

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
