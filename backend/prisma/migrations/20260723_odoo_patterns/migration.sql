-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('PENDIENTE', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('PENDIENTE', 'RECIBIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "secuencias" (
    "id" TEXT NOT NULL,
    "prefijo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "descripcion" TEXT,

    CONSTRAINT "secuencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "accion" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "registroId" TEXT,
    "datos" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secuencias_prefijo_key" ON "secuencias"("prefijo");

-- CreateIndex
CREATE INDEX "audit_logs_modelo_registroId_idx" ON "audit_logs"("modelo", "registroId");

-- CreateIndex
CREATE INDEX "audit_logs_fecha_idx" ON "audit_logs"("fecha");

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: productos
ALTER TABLE "productos" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: insumos
ALTER TABLE "insumos" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: recetas
ALTER TABLE "recetas" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: cajas
ALTER TABLE "cajas" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: proveedores
ALTER TABLE "proveedores" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: ventas
ALTER TABLE "ventas" ADD COLUMN "numero" TEXT,
ADD COLUMN "estado" "EstadoVenta" NOT NULL DEFAULT 'COMPLETADA',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- AlterTable: compras
ALTER TABLE "compras" ADD COLUMN "numero" TEXT,
ADD COLUMN "estado" "EstadoCompra" NOT NULL DEFAULT 'RECIBIDA',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ventas_numero_key" ON "ventas"("numero");

-- CreateIndex
CREATE INDEX "ventas_empleadoId_idx" ON "ventas"("empleadoId");

-- CreateIndex
CREATE INDEX "ventas_createdAt_idx" ON "ventas"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "compras_numero_key" ON "compras"("numero");

-- CreateIndex
CREATE INDEX "compras_proveedorId_idx" ON "compras"("proveedorId");

-- CreateIndex
CREATE INDEX "compras_fecha_idx" ON "compras"("fecha");

-- CreateIndex
CREATE INDEX "stock_movimientos_insumoId_idx" ON "stock_movimientos"("insumoId");

-- CreateIndex
CREATE INDEX "stock_movimientos_fecha_idx" ON "stock_movimientos"("fecha");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert secuencias iniciales
INSERT INTO "secuencias" ("id", "prefijo", "valor", "padding", "descripcion") VALUES
  ('sec_ventas', 'VTA', 1, 4, 'Secuencia para números de venta'),
  ('sec_compras', 'COM', 1, 4, 'Secuencia para números de compra');
