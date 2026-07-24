import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignPedidosDto, CreateRepartoDto, UpdateEstadoRepartoDto } from './dto/create-reparto.dto';

@Injectable()
export class RepartosService {
  constructor(private prisma: PrismaService) {}

  private readonly TRANSICIONES: Record<string, string[]> = {
    PENDIENTE: ['EN_CURSO', 'COMPLETADO'],
    EN_CURSO: ['COMPLETADO'],
    COMPLETADO: [],
  };

  findAll(estado?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    return this.prisma.reparto.findMany({
      where,
      include: {
        zonaReparto: true,
        pedidos: {
          include: {
            cliente: { select: { nombre: true } },
            items: { include: { producto: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.reparto.findUniqueOrThrow({
      where: { id },
      include: {
        zonaReparto: true,
        pedidos: {
          include: {
            cliente: { include: { listaPrecio: true } },
            direccionEntrega: true,
            items: { include: { producto: true } },
          },
        },
      },
    });
  }

  async create(dto: CreateRepartoDto) {
    const numero = `RE-${Date.now().toString(36).toUpperCase()}`;

    return this.prisma.reparto.create({
      data: {
        numero,
        zonaRepartoId: dto.zonaRepartoId,
        observaciones: dto.observaciones,
        ...(dto.pedidoIds?.length && {
          pedidos: {
            connect: dto.pedidoIds.map((id) => ({ id })),
          },
        }),
      },
      include: { zonaReparto: true, pedidos: true },
    });
  }

  async updateEstado(id: string, dto: UpdateEstadoRepartoDto) {
    const reparto = await this.prisma.reparto.findUniqueOrThrow({ where: { id } });
    const permitidos = this.TRANSICIONES[reparto.estado] || [];

    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar de "${reparto.estado}" a "${dto.estado}"`,
      );
    }

    if (dto.estado === 'COMPLETADO') {
      await this.prisma.pedido.updateMany({
        where: { repartoId: id },
        data: { estado: 'ENTREGADO' },
      });
    }

    return this.prisma.reparto.update({
      where: { id },
      data: { estado: dto.estado },
      include: {
        zonaReparto: true,
        pedidos: { include: { cliente: { select: { nombre: true } } } },
      },
    });
  }

  async assignPedidos(id: string, dto: AssignPedidosDto) {
    const reparto = await this.prisma.reparto.findUniqueOrThrow({ where: { id } });
    if (reparto.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden asignar pedidos a un reparto pendiente');
    }

    await this.prisma.pedido.updateMany({
      where: { id: { in: dto.pedidoIds } },
      data: { repartoId: id, estado: 'EN_ENTREGA' },
    });

    return this.findOne(id);
  }

  async removePedido(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUniqueOrThrow({ where: { id: pedidoId } });
    if (!pedido.repartoId) throw new BadRequestException('El pedido no tiene reparto asignado');

    const reparto = await this.prisma.reparto.findUnique({ where: { id: pedido.repartoId } });
    if (reparto && reparto.estado !== 'PENDIENTE') {
      throw new BadRequestException('No se pueden quitar pedidos de un reparto en curso');
    }

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { repartoId: null, estado: 'LISTO' },
    });
  }
}
