import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto, UpdateEstadoPedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  private readonly TRANSICIONES: Record<string, string[]> = {
    BORRADOR: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['PREPARANDO', 'CANCELADO'],
    PREPARANDO: ['LISTO', 'CANCELADO'],
    LISTO: ['EN_ENTREGA', 'CANCELADO'],
    EN_ENTREGA: ['ENTREGADO', 'CANCELADO'],
    ENTREGADO: [],
    CANCELADO: [],
  };

  findAll(estado?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    return this.prisma.pedido.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true, tipo: true } },
        direccionEntrega: true,
        items: { include: { producto: true } },
        reparto: { select: { id: true, numero: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.pedido.findUniqueOrThrow({
      where: { id },
      include: {
        cliente: { include: { listaPrecio: true } },
        direccionEntrega: true,
        items: { include: { producto: true } },
        reparto: true,
      },
    });
  }

  async create(dto: CreatePedidoDto) {
    const numero = `PD-${Date.now().toString(36).toUpperCase()}`;
    const total = dto.items.reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);

    return this.prisma.pedido.create({
      data: {
        numero,
        clienteId: dto.clienteId,
        direccionEntregaId: dto.direccionEntregaId,
        observaciones: dto.observaciones,
        fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
        total,
        items: {
          create: dto.items.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            precioUnit: i.precioUnit,
            subtotal: i.cantidad * i.precioUnit,
          })),
        },
      },
      include: {
        cliente: { select: { nombre: true } },
        items: { include: { producto: true } },
      },
    });
  }

  async updateEstado(id: string, dto: UpdateEstadoPedidoDto) {
    const pedido = await this.prisma.pedido.findUniqueOrThrow({ where: { id } });
    const permitidos = this.TRANSICIONES[pedido.estado] || [];

    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar de "${pedido.estado}" a "${dto.estado}"`,
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: dto.estado },
      include: {
        cliente: { select: { nombre: true } },
        items: { include: { producto: true } },
      },
    });
  }

  async removeFromReparto(id: string) {
    return this.prisma.pedido.update({
      where: { id },
      data: { repartoId: null, estado: 'LISTO' },
    });
  }
}
