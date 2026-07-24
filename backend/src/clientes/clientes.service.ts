import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.cliente.findMany({
      where: { activo: true },
      include: { listaPrecio: true },
      orderBy: { nombre: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.cliente.findUniqueOrThrow({
      where: { id },
      include: { listaPrecio: { include: { items: { include: { producto: true } } } } },
    });
  }

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto, include: { listaPrecio: true } });
  }

  update(id: string, dto: Partial<CreateClienteDto>) {
    return this.prisma.cliente.update({ where: { id }, data: dto, include: { listaPrecio: true } });
  }

  remove(id: string) {
    return this.prisma.cliente.update({ where: { id }, data: { activo: false } });
  }
}
