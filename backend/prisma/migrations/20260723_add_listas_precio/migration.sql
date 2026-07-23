-- CreateTable
CREATE TABLE "listas_precio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "listas_precio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_precio_items" (
    "id" TEXT NOT NULL,
    "listaPrecioId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "lista_precio_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lista_precio_items_listaPrecioId_productoId_key" ON "lista_precio_items"("listaPrecioId", "productoId");

-- AddForeignKey
ALTER TABLE "lista_precio_items" ADD CONSTRAINT "lista_precio_items_listaPrecioId_fkey" FOREIGN KEY ("listaPrecioId") REFERENCES "listas_precio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_precio_items" ADD CONSTRAINT "lista_precio_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- AlterTable: Add listaPrecioId to clientes
ALTER TABLE "clientes" ADD COLUMN "listaPrecioId" TEXT;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_listaPrecioId_fkey" FOREIGN KEY ("listaPrecioId") REFERENCES "listas_precio"("id") ON UPDATE CASCADE ON DELETE SET NULL;
