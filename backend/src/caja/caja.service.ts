import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirCajaDto, CerrarCajaDto, MovimientoCajaDto } from './dto/caja.dto';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.caja.findMany({
      orderBy: { fechaApertura: 'desc' },
      include: { _count: { select: { ventas: true } } },
    });
  }

  findActual() {
    return this.prisma.caja.findFirst({
      where: { estado: 'ABIERTA' },
      include: {
        ventas: {
          include: { items: { include: { producto: true } } },
          orderBy: { fecha: 'desc' },
        },
        movimientos: { orderBy: { fecha: 'desc' } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.caja.findUniqueOrThrow({
      where: { id },
      include: {
        ventas: { include: { items: { include: { producto: true } }, empleado: { select: { nombre: true } } } },
        movimientos: { orderBy: { fecha: 'desc' } },
      },
    });
  }

  async abrir(dto: AbrirCajaDto) {
    const abierta = await this.prisma.caja.findFirst({ where: { estado: 'ABIERTA' } });
    if (abierta) throw new BadRequestException('Ya existe una caja abierta');
    return this.prisma.caja.create({ data: { montoInicial: dto.montoInicial } });
  }

  async cerrar(id: string, dto: CerrarCajaDto) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
      include: {
        ventas: true,
        movimientos: true,
      },
    });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado !== 'ABIERTA') throw new BadRequestException('La caja ya está cerrada');

    const totalVentas = caja.ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalIngresos = caja.movimientos
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);
    const totalEgresos = caja.movimientos
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const montoEsperado = Number(caja.montoInicial) + totalVentas + totalIngresos - totalEgresos;
    const diferencia = dto.montoFinalReal - montoEsperado;

    return this.prisma.caja.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        fechaCierre: new Date(),
        montoFinalReal: dto.montoFinalReal,
        montoEsperado,
        diferencia,
        observaciones: dto.observaciones,
      },
    });
  }

  async addMovimiento(cajaId: string, dto: MovimientoCajaDto) {
    const caja = await this.prisma.caja.findUniqueOrThrow({ where: { id: cajaId } });
    if (caja.estado !== 'ABIERTA') throw new BadRequestException('La caja está cerrada');
    return this.prisma.movimientoCaja.create({
      data: { cajaId, tipo: dto.tipo, concepto: dto.concepto, monto: dto.monto },
    });
  }
}
