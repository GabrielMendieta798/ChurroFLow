import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.cliente.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.cliente.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateClienteDto>) {
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.cliente.update({ where: { id }, data: { activo: false } });
  }
}
