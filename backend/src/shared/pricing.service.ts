import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async resolvePrice(productoId: string, clienteId?: string): Promise<number> {
    const producto = await this.prisma.producto.findUniqueOrThrow({
      where: { id: productoId },
      select: { precio: true, precioMayorista: true },
    });

    if (!clienteId) {
      return Number(producto.precio);
    }

    const cliente = await this.prisma.cliente.findUniqueOrThrow({
      where: { id: clienteId },
      select: { tipo: true, listaPrecioId: true },
    });

    if (cliente.listaPrecioId) {
      const item = await this.prisma.listaPrecioItem.findUnique({
        where: {
          listaPrecioId_productoId: {
            listaPrecioId: cliente.listaPrecioId,
            productoId,
          },
        },
        select: { precio: true },
      });

      if (item) return Number(item.precio);
    }

    if (cliente.tipo === 'MAYORISTA' && producto.precioMayorista) {
      return Number(producto.precioMayorista);
    }

    return Number(producto.precio);
  }

  async resolvePrices(productoIds: string[], clienteId?: string): Promise<Record<string, number>> {
    const result: Record<string, number> = {};

    for (const id of productoIds) {
      result[id] = await this.resolvePrice(id, clienteId);
    }

    return result;
  }
}
