-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('MINORISTA', 'MAYORISTA');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "tipo" "TipoCliente" NOT NULL DEFAULT 'MINORISTA',
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cuit_key" ON "clientes"("cuit");
