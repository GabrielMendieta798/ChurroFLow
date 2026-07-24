import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenProduccionDto, UpdateEstadoDto } from './dto/create-orden-produccion.dto';

@Injectable()
export class ProduccionService {
  constructor(private prisma: PrismaService) {}

  findAll(estado?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    return this.prisma.ordenProduccion.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, categoria: true, stockActual: true, stockMinimo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.ordenProduccion.findUniqueOrThrow({
      where: { id },
      include: {
        producto: {
          include: {
            receta: { include: { items: { include: { insumo: true } } } },
          },
        },
      },
    });
  }

  create(dto: CreateOrdenProduccionDto) {
    const numero = `OP-${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.ordenProduccion.create({
      data: { ...dto, numero },
      include: {
        producto: { select: { nombre: true, stockActual: true } },
      },
    });
  }

  async updateEstado(id: string, dto: UpdateEstadoDto) {
    const orden = await this.prisma.ordenProduccion.findUniqueOrThrow({
      where: { id },
      include: {
        producto: {
          include: { receta: { include: { items: { include: { insumo: true } } } } },
        },
      },
    });

    if (orden.estado === 'COMPLETADA' || orden.estado === 'CANCELADA') {
      throw new BadRequestException(`La orden ya está ${orden.estado.toLowerCase()}`);
    }

    if (dto.estado === 'EN_PROCESO') {
      return this.prisma.ordenProduccion.update({
        where: { id },
        data: { estado: 'EN_PROCESO', fechaInicio: new Date() },
        include: { producto: { select: { nombre: true } } },
      });
    }

    if (dto.estado === 'COMPLETADA') {
      return this.completar(orden);
    }

    if (dto.estado === 'CANCELADA') {
      return this.prisma.ordenProduccion.update({
        where: { id },
        data: { estado: 'CANCELADA' },
        include: { producto: { select: { nombre: true } } },
      });
    }

    return this.prisma.ordenProduccion.update({
      where: { id },
      data: { estado: dto.estado },
      include: { producto: { select: { nombre: true } } },
    });
  }

  private async completar(orden: any) {
    const receta = orden.producto.receta;

    if (!receta || receta.items.length === 0) {
      throw new BadRequestException(
        `El producto "${orden.producto.nombre}" no tiene receta configurada. No se puede producir sin saber qué insumos consume.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of receta.items) {
        const consumo = Number(item.cantidad) * orden.cantidad;
        const insumo = await tx.insumo.findUniqueOrThrow({ where: { id: item.insumoId } });

        if (Number(insumo.stockActual) < consumo) {
          throw new BadRequestException(
            `Stock insuficiente de "${insumo.nombre}": disponible ${insumo.stockActual}, necesario ${consumo}`,
          );
        }

        await tx.insumo.update({
          where: { id: item.insumoId },
          data: { stockActual: { decrement: consumo } },
        });

        await tx.stockMovimiento.create({
          data: {
            insumoId: item.insumoId,
            tipo: 'SALIDA',
            cantidad: consumo,
            motivo: `Producción #${orden.numero}`,
          },
        });
      }

      await tx.producto.update({
        where: { id: orden.productoId },
        data: { stockActual: { increment: orden.cantidad } },
      });

      return tx.ordenProduccion.update({
        where: { id: orden.id },
        data: { estado: 'COMPLETADA', fechaFin: new Date() },
        include: { producto: { select: { nombre: true, stockActual: true } } },
      });
    });
  }

  async getProductosBajoStock() {
    return this.prisma.producto.findMany({
      where: {
        activo: true,
        receta: { isNot: null },
        stockActual: { lte: this.prisma.producto.fields?.stockMinimo as any },
      },
      select: { id: true, nombre: true, stockActual: true, stockMinimo: true, categoria: true },
    });
  }
}
