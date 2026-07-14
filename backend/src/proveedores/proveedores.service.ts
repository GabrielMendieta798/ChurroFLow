import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  }

  create(dto: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateProveedorDto>) {
    return this.prisma.proveedor.update({ where: { id }, data: dto });
  }
}
