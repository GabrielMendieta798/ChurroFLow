import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanzasService {
  constructor(private prisma: PrismaService) {}

  private inicioMes() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  async getResumen(fechaDesde?: string, fechaHasta?: string) {
    const desde = fechaDesde ? new Date(fechaDesde) : this.inicioMes();
    const hasta = fechaHasta ? new Date(fechaHasta) : new Date();
    hasta.setHours(23, 59, 59, 999);

    const [ventas, compras, movimientosCaja, pedidosEntregados] = await Promise.all([
      this.prisma.venta.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
        include: { items: { include: { producto: true } } },
      }),
      this.prisma.compra.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
        include: { items: true },
      }),
      this.prisma.movimientoCaja.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
      }),
      this.prisma.pedido.findMany({
        where: {
          estado: 'ENTREGADO',
          createdAt: { gte: desde, lte: hasta },
        },
        include: { items: { include: { producto: true } } },
      }),
    ]);

    const totalVentas = ventas.reduce((s, v) => s + Number(v.total), 0);
    const totalCompras = compras.reduce((s, c) => s + Number(c.total), 0);
    const totalPedidos = pedidosEntregados.reduce((s, p) => s + Number(p.total), 0);
    const ingresosCaja = movimientosCaja
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((s, m) => s + Number(m.monto), 0);
    const egresosCaja = movimientosCaja
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((s, m) => s + Number(m.monto), 0);

    const ingresosTotales = totalVentas + totalPedidos + ingresosCaja;
    const egresosTotales = totalCompras + egresosCaja;
    const gananciaNeta = ingresosTotales - egresosTotales;
    const margen = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0;

    return {
      periodo: { desde: desde.toISOString(), hasta: hasta.toISOString() },
      ingresos: {
        ventas: totalVentas,
        pedidos: totalPedidos,
        otros: ingresosCaja,
        total: ingresosTotales,
      },
      egresos: {
        compras: totalCompras,
        otros: egresosCaja,
        total: egresosTotales,
      },
      gananciaNeta,
      margen: Math.round(margen * 100) / 100,
      cantidadVentas: ventas.length,
      cantidadPedidos: pedidosEntregados.length,
      ticketPromedio: ventas.length > 0 ? totalVentas / ventas.length : 0,
    };
  }

  async getFlujoCaja(fechaDesde?: string, fechaHasta?: string) {
    const desde = fechaDesde ? new Date(fechaDesde) : this.inicioMes();
    const hasta = fechaHasta ? new Date(fechaHasta) : new Date();
    hasta.setHours(23, 59, 59, 999);

    const [ventas, compras, movimientos] = await Promise.all([
      this.prisma.venta.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
        select: { total: true, metodoPago: true, fecha: true },
        orderBy: { fecha: 'asc' },
      }),
      this.prisma.compra.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
        select: { total: true, fecha: true },
        orderBy: { fecha: 'asc' },
      }),
      this.prisma.movimientoCaja.findMany({
        where: { fecha: { gte: desde, lte: hasta } },
        orderBy: { fecha: 'asc' },
      }),
    ]);

    const porDia: Record<string, { ingresos: number; egresos: number; saldo: number }> = {};

    for (const v of ventas) {
      const dia = v.fecha.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { ingresos: 0, egresos: 0, saldo: 0 };
      porDia[dia].ingresos += Number(v.total);
    }

    for (const c of compras) {
      const dia = c.fecha.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { ingresos: 0, egresos: 0, saldo: 0 };
      porDia[dia].egresos += Number(c.total);
    }

    for (const m of movimientos) {
      const dia = m.fecha.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { ingresos: 0, egresos: 0, saldo: 0 };
      if (m.tipo === 'INGRESO') porDia[dia].ingresos += Number(m.monto);
      else porDia[dia].egresos += Number(m.monto);
    }

    const flujo = Object.entries(porDia)
      .map(([fecha, data]) => ({
        fecha,
        ...data,
        saldo: data.ingresos - data.egresos,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    let acumulado = 0;
    for (const dia of flujo) {
      acumulado += dia.saldo;
      dia.saldo = acumulado;
    }

    const porMetodoPago: Record<string, number> = {};
    for (const v of ventas) {
      porMetodoPago[v.metodoPago] = (porMetodoPago[v.metodoPago] || 0) + Number(v.total);
    }

    return { flujo, porMetodoPago };
  }

  async getCostosPorProducto() {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true },
      include: {
        receta: {
          include: {
            items: { include: { insumo: true } },
          },
        },
      },
    });

    return productos
      .map((p) => {
        let costoMateriaPrima = 0;
        if (p.receta) {
          for (const item of p.receta.items) {
            costoMateriaPrima += Number(item.cantidad) * Number(item.insumo.costoUnitario);
          }
        }

        const precioVenta = Number(p.precio);
        const costoCompra = p.precioCompra ? Number(p.precioCompra) : costoMateriaPrima;
        const ganancia = precioVenta - costoCompra;
        const margen = precioVenta > 0 ? (ganancia / precioVenta) * 100 : 0;

        return {
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precioVenta,
          costoCompra,
          costoMateriaPrima,
          gananciaUnitaria: ganancia,
          margen: Math.round(margen * 100) / 100,
          stockActual: Number(p.stockActual),
        };
      })
      .sort((a, b) => b.margen - a.margen);
  }

  async getTopProductos(fechaDesde?: string, fechaHasta?: string, limit = 10) {
    const desde = fechaDesde ? new Date(fechaDesde) : this.inicioMes();
    const hasta = fechaHasta ? new Date(fechaHasta) : new Date();
    hasta.setHours(23, 59, 59, 999);

    const ventas = await this.prisma.venta.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      include: { items: { include: { producto: true } } },
    });

    const conteo: Record<string, {
      nombre: string; categoria: string; cantidad: number; ingresos: number;
    }> = {};

    for (const venta of ventas) {
      for (const item of venta.items) {
        const key = item.productoId;
        if (!conteo[key]) {
          conteo[key] = {
            nombre: item.producto.nombre,
            categoria: item.producto.categoria,
            cantidad: 0,
            ingresos: 0,
          };
        }
        conteo[key].cantidad += item.cantidad;
        conteo[key].ingresos += Number(item.subtotal);
      }
    }

    return Object.entries(conteo)
      .map(([id, data]) => ({
        id,
        nombre: data.nombre,
        categoria: data.categoria,
        unidadesVendidas: data.cantidad,
        ingresos: data.ingresos,
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, limit);
  }
}
