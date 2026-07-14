import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AjusteStockDto } from './dto/ajuste-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  findMovimientos(insumoId?: string) {
    return this.prisma.stockMovimiento.findMany({
      where: insumoId ? { insumoId } : undefined,
      include: { insumo: true },
      orderBy: { fecha: 'desc' },
      take: 200,
    });
  }

  findBajoStock() {
    return this.prisma.$queryRaw`
      SELECT * FROM insumos
      WHERE activo = true AND "stockActual" <= "stockMinimo"
      ORDER BY nombre
    `;
  }

  async ajustar(dto: AjusteStockDto) {
    return this.prisma.$transaction(async (tx) => {
      let delta = dto.cantidad;
      if (dto.tipo === 'SALIDA' || dto.tipo === 'PERDIDA') delta = -dto.cantidad;

      await tx.insumo.update({
        where: { id: dto.insumoId },
        data: { stockActual: { increment: delta } },
      });

      return tx.stockMovimiento.create({
        data: {
          insumoId: dto.insumoId,
          tipo: dto.tipo,
          cantidad: dto.cantidad,
          motivo: dto.motivo,
        },
        include: { insumo: true },
      });
    });
  }
}
