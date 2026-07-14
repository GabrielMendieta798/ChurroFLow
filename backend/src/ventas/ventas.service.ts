import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  findAll(fechaDesde?: string, fechaHasta?: string) {
    const where: any = {};
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }
    return this.prisma.venta.findMany({
      where,
      include: {
        empleado: { select: { nombre: true } },
        items: { include: { producto: true } },
        caja: { select: { id: true, fechaApertura: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.venta.findUniqueOrThrow({
      where: { id },
      include: {
        empleado: { select: { nombre: true } },
        items: { include: { producto: true } },
      },
    });
  }

  async create(dto: CreateVentaDto, empleadoId: string) {
    const caja = await this.prisma.caja.findUniqueOrThrow({ where: { id: dto.cajaId } });
    if (caja.estado !== 'ABIERTA') {
      throw new BadRequestException('La caja está cerrada');
    }

    const total = dto.items.reduce((sum, item) => sum + item.cantidad * item.precioUnit, 0);

    const venta = await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          empleadoId,
          cajaId: dto.cajaId,
          total,
          metodoPago: dto.metodoPago,
          observaciones: dto.observaciones,
          items: {
            create: dto.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnit: item.precioUnit,
              subtotal: item.cantidad * item.precioUnit,
            })),
          },
        },
        include: { items: true },
      });

      // Descontar stock según receta de cada producto
      for (const item of dto.items) {
        const receta = await tx.receta.findUnique({
          where: { productoId: item.productoId },
          include: { items: true },
        });
        if (!receta) continue;

        for (const recetaItem of receta.items) {
          const consumo = Number(recetaItem.cantidad) * item.cantidad;
          await tx.insumo.update({
            where: { id: recetaItem.insumoId },
            data: { stockActual: { decrement: consumo } },
          });
          await tx.stockMovimiento.create({
            data: {
              insumoId: recetaItem.insumoId,
              tipo: 'SALIDA',
              cantidad: consumo,
              motivo: `Venta #${venta.id.slice(0, 8)}`,
            },
          });
        }
      }

      return venta;
    });

    return this.findOne(venta.id);
  }
}
