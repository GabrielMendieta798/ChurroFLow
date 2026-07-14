import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.compra.findMany({
      include: {
        proveedor: true,
        items: { include: { insumo: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.compra.findUniqueOrThrow({
      where: { id },
      include: { proveedor: true, items: { include: { insumo: true } } },
    });
  }

  async create(dto: CreateCompraDto) {
    const total = dto.items.reduce((sum, i) => sum + i.cantidad * i.costoUnit, 0);

    return this.prisma.$transaction(async (tx) => {
      const compra = await tx.compra.create({
        data: {
          proveedorId: dto.proveedorId,
          total,
          observaciones: dto.observaciones,
          items: {
            create: dto.items.map((i) => ({
              insumoId: i.insumoId,
              cantidad: i.cantidad,
              costoUnit: i.costoUnit,
              subtotal: i.cantidad * i.costoUnit,
            })),
          },
        },
      });

      for (const item of dto.items) {
        await tx.insumo.update({
          where: { id: item.insumoId },
          data: {
            stockActual: { increment: item.cantidad },
            costoUnitario: item.costoUnit,
          },
        });
        await tx.stockMovimiento.create({
          data: {
            insumoId: item.insumoId,
            tipo: 'ENTRADA',
            cantidad: item.cantidad,
            motivo: `Compra #${compra.id.slice(0, 8)}`,
          },
        });
      }

      return compra;
    });
  }
}
