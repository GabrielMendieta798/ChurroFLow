import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.producto.findMany({
      where: { activo: true },
      include: { receta: { include: { items: { include: { insumo: true } } } } },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.producto.findUniqueOrThrow({
      where: { id },
      include: { receta: { include: { items: { include: { insumo: true } } } } },
    });
  }

  create(dto: CreateProductoDto) {
    return this.prisma.producto.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateProductoDto>) {
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.producto.update({ where: { id }, data: { activo: false } });
  }
}
