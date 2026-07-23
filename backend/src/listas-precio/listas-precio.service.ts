import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';

@Injectable()
export class ListasPrecioService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.listaPrecio.findMany({
      where: { activo: true },
      include: { items: { include: { producto: true } }, _count: { select: { clientes: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.listaPrecio.findUniqueOrThrow({
      where: { id },
      include: { items: { include: { producto: true } }, clientes: { select: { id: true, nombre: true } } },
    });
  }

  async create(dto: CreateListaPrecioDto) {
    return this.prisma.listaPrecio.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        items: {
          create: dto.items.map((item) => ({
            productoId: item.productoId,
            precio: item.precio,
          })),
        },
      },
      include: { items: { include: { producto: true } } },
    });
  }

  async update(id: string, dto: Partial<CreateListaPrecioDto>) {
    const existing = await this.prisma.listaPrecio.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lista de precio no encontrada');

    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;

    if (dto.items) {
      await this.prisma.listaPrecioItem.deleteMany({ where: { listaPrecioId: id } });
      data.items = {
        create: dto.items.map((item) => ({
          productoId: item.productoId,
          precio: item.precio,
        })),
      };
    }

    return this.prisma.listaPrecio.update({
      where: { id },
      data,
      include: { items: { include: { producto: true } } },
    });
  }

  remove(id: string) {
    return this.prisma.listaPrecio.update({
      where: { id },
      data: { activo: false },
    });
  }
}
