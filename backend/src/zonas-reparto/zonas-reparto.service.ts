import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateZonaRepartoDto } from './dto/create-zona-reparto.dto';

@Injectable()
export class ZonasRepartoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.zonaReparto.findMany({ orderBy: { nombre: 'asc' } });
  }

  create(dto: CreateZonaRepartoDto) {
    return this.prisma.zonaReparto.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateZonaRepartoDto>) {
    return this.prisma.zonaReparto.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.zonaReparto.update({ where: { id }, data: { activo: false } });
  }
}
