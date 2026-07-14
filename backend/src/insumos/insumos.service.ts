import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.insumo.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  findBajoStock() {
    return this.prisma.insumo.findMany({
      where: { activo: true, stockActual: { lte: this.prisma.insumo.fields.stockMinimo } },
    });
  }

  findOne(id: string) {
    return this.prisma.insumo.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateInsumoDto) {
    return this.prisma.insumo.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateInsumoDto>) {
    return this.prisma.insumo.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.insumo.update({ where: { id }, data: { activo: false } });
  }
}
