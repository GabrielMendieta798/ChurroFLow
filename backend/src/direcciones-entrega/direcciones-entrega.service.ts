import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDireccionEntregaDto } from './dto/create-direccion-entrega.dto';

@Injectable()
export class DireccionesEntregaService {
  constructor(private prisma: PrismaService) {}

  findByCliente(clienteId: string) {
    return this.prisma.direccionEntrega.findMany({
      where: { clienteId, activo: true },
      orderBy: { alias: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.direccionEntrega.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateDireccionEntregaDto) {
    return this.prisma.direccionEntrega.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateDireccionEntregaDto>) {
    return this.prisma.direccionEntrega.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.direccionEntrega.update({ where: { id }, data: { activo: false } });
  }
}
