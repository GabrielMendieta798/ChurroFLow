-- CreateTable
CREATE TABLE "direcciones_entrega" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "barrio" TEXT,
    "ciudad" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_entrega_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ventas" ADD COLUMN "clienteId" TEXT;

-- CreateIndex
CREATE INDEX "direcciones_entrega_clienteId_idx" ON "direcciones_entrega"("clienteId");

-- CreateIndex
CREATE INDEX "ventas_clienteId_idx" ON "ventas"("clienteId");

-- AddForeignKey
ALTER TABLE "direcciones_entrega" ADD CONSTRAINT "direcciones_entrega_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
