import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecetaDto } from './dto/create-receta.dto';

@Injectable()
export class RecetasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.receta.findMany({
      include: {
        producto: true,
        items: { include: { insumo: true } },
      },
    });
  }

  findByProducto(productoId: string) {
    return this.prisma.receta.findUnique({
      where: { productoId },
      include: { items: { include: { insumo: true } } },
    });
  }

  async upsert(dto: CreateRecetaDto) {
    const existing = await this.prisma.receta.findUnique({ where: { productoId: dto.productoId } });

    if (existing) {
      await this.prisma.recetaItem.deleteMany({ where: { recetaId: existing.id } });
      return this.prisma.receta.update({
        where: { id: existing.id },
        data: {
          items: { create: dto.items.map((i) => ({ insumoId: i.insumoId, cantidad: i.cantidad })) },
        },
        include: { items: { include: { insumo: true } } },
      });
    }

    return this.prisma.receta.create({
      data: {
        productoId: dto.productoId,
        items: { create: dto.items.map((i) => ({ insumoId: i.insumoId, cantidad: i.cantidad })) },
      },
      include: { items: { include: { insumo: true } } },
    });
  }

  remove(productoId: string) {
    return this.prisma.receta.delete({ where: { productoId } });
  }
}
