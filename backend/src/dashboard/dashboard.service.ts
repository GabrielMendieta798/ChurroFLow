import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getResumenHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [ventas, compras, insumosBajoStock, cajaActual] = await Promise.all([
      this.prisma.venta.findMany({
        where: { fecha: { gte: hoy, lt: manana } },
        include: { items: { include: { producto: true } } },
      }),
      this.prisma.compra.findMany({
        where: { fecha: { gte: hoy, lt: manana } },
      }),
      this.prisma.$queryRaw<any[]>`
        SELECT id, nombre, unidad, "stockActual", "stockMinimo"
        FROM insumos
        WHERE activo = true AND "stockActual" <= "stockMinimo"
        ORDER BY nombre
      `,
      this.prisma.caja.findFirst({ where: { estado: 'ABIERTA' } }),
    ]);

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalCompras = compras.reduce((sum, c) => sum + Number(c.total), 0);

    // Productos más vendidos hoy
    const conteoProductos: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    for (const venta of ventas) {
      for (const item of venta.items) {
        const key = item.productoId;
        if (!conteoProductos[key]) {
          conteoProductos[key] = { nombre: item.producto.nombre, cantidad: 0, total: 0 };
        }
        conteoProductos[key].cantidad += item.cantidad;
        conteoProductos[key].total += Number(item.subtotal);
      }
    }
    const productosMasVendidos = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Ventas por método de pago
    const ventasPorMetodo = ventas.reduce(
      (acc, v) => {
        const key = v.metodoPago;
        acc[key] = (acc[key] || 0) + Number(v.total);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      fecha: hoy,
      cajaActual,
      ventas: {
        cantidad: ventas.length,
        total: totalVentas,
        porMetodoPago: ventasPorMetodo,
      },
      compras: {
        cantidad: compras.length,
        total: totalCompras,
      },
      gananciaEstimada: totalVentas - totalCompras,
      productosMasVendidos,
      insumosBajoStock,
    };
  }

  async getVentasPorPeriodo(fechaDesde: string, fechaHasta: string) {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999);

    const ventas = await this.prisma.venta.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      include: { items: { include: { producto: true } } },
      orderBy: { fecha: 'asc' },
    });

    // Agrupar por día
    const porDia: Record<string, number> = {};
    for (const venta of ventas) {
      const dia = venta.fecha.toISOString().split('T')[0];
      porDia[dia] = (porDia[dia] || 0) + Number(venta.total);
    }

    return {
      total: ventas.reduce((sum, v) => sum + Number(v.total), 0),
      cantidad: ventas.length,
      porDia: Object.entries(porDia).map(([fecha, total]) => ({ fecha, total })),
    };
  }
}
