import { useEffect, useState } from 'react';
import { finanzasApi } from '../api/endpoints';
import type { CostoProducto, FlujoCajaDia, ResumenFinanciero, TopProducto } from '../types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Package, ShoppingCart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

function StatCard({ label, value, icon: Icon, color, subtext }: {
  label: string; value: string; icon: any; color: string; subtext?: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
      </div>
    </div>
  );
}

type Tab = 'resumen' | 'flujo' | 'costos' | 'ranking';

export default function Finanzas() {
  const [tab, setTab] = useState<Tab>('resumen');
  const [fechaDesde, setFechaDesde] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [flujo, setFlujo] = useState<FlujoCajaDia[]>([]);
  const [porMetodo, setPorMetodo] = useState<Record<string, number>>({});
  const [costos, setCostos] = useState<CostoProducto[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  const pct = (n: number) => `${n.toFixed(1)}%`;

  useEffect(() => {
    if (tab === 'resumen' || tab === 'flujo' || tab === 'ranking') {
      finanzasApi.getResumen(fechaDesde, fechaHasta).then((r) => setResumen(r.data));
      finanzasApi.getFlujoCaja(fechaDesde, fechaHasta).then((r) => {
        setFlujo(r.data.flujo);
        setPorMetodo(r.data.porMetodoPago);
      });
      if (tab === 'ranking') {
        finanzasApi.getTopProductos(fechaDesde, fechaHasta).then((r) => setTopProductos(r.data));
      }
    }
    if (tab === 'costos') {
      finanzasApi.getCostosPorProducto().then((r) => setCostos(r.data));
    }
  }, [tab, fechaDesde, fechaHasta]);

  const tabs: { value: Tab; label: string }[] = [
    { value: 'resumen', label: 'Resumen' },
    { value: 'flujo', label: 'Flujo de Caja' },
    { value: 'costos', label: 'Costos por Producto' },
    { value: 'ranking', label: 'Ranking' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Finanzas</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="input text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="input text-sm" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px]',
              tab === t.value
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resumen Tab */}
      {tab === 'resumen' && resumen && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Ingresos totales" value={fmt(resumen.ingresos.total)} icon={TrendingUp} color="bg-green-500"
              subtext={`Ventas: ${fmt(resumen.ingresos.ventas)} · Pedidos: ${fmt(resumen.ingresos.pedidos)}`} />
            <StatCard label="Egresos totales" value={fmt(resumen.egresos.total)} icon={TrendingDown} color="bg-red-500"
              subtext={`Compras: ${fmt(resumen.egresos.compras)} · Otros: ${fmt(resumen.egresos.otros)}`} />
            <StatCard label="Ganancia neta" value={fmt(resumen.gananciaNeta)} icon={DollarSign} color="bg-brand-500"
              subtext={`Margen: ${pct(resumen.margen)}`} />
            <StatCard label="Ticket promedio" value={fmt(resumen.ticketPromedio)} icon={BarChart3} color="bg-blue-500"
              subtext={`${resumen.cantidadVentas} ventas`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de flujo de caja */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Saldo acumulado</h3>
              {flujo.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos en el período</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={flujo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" fontSize={11} tickFormatter={(d) => format(new Date(d), 'dd/MM')} />
                    <YAxis fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${Number(v).toLocaleString('es-AR')}`, '']} />
                    <Line type="monotone" dataKey="saldo" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Métodos de pago */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Ventas por método de pago</h3>
              <div className="space-y-3">
                {Object.entries(porMetodo).map(([metodo, total]) => {
                  const totalGeneral = Object.values(porMetodo).reduce((s, v) => s + v, 0);
                  const pctVal = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
                  const colors: Record<string, string> = {
                    EFECTIVO: 'bg-green-500', TRANSFERENCIA: 'bg-blue-500', MERCADO_PAGO: 'bg-sky-400',
                  };
                  return (
                    <div key={metodo}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {metodo === 'EFECTIVO' ? 'Efectivo' : metodo === 'TRANSFERENCIA' ? 'Transferencia' : 'Mercado Pago'}
                        </span>
                        <span className="text-sm font-semibold">{fmt(total)} ({pct(pctVal)})</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[metodo] || 'bg-gray-400'}`} style={{ width: `${pctVal}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(porMetodo).length === 0 && (
                  <p className="text-gray-400 text-sm">Sin ventas en el período</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Flujo de Caja Tab */}
      {tab === 'flujo' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Flujo de Caja Diario</h3>
          {flujo.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos en el período</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={flujo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" fontSize={11} tickFormatter={(d) => format(new Date(d), 'dd/MM')} />
                  <YAxis fontSize={11} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString('es-AR')}`, '']} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="pb-2 font-medium">Fecha</th>
                      <th className="pb-2 font-medium text-right">Ingresos</th>
                      <th className="pb-2 font-medium text-right">Egresos</th>
                      <th className="pb-2 font-medium text-right">Saldo acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {flujo.map((dia) => (
                      <tr key={dia.fecha} className="hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{format(new Date(dia.fecha), "d 'de' MMMM", { locale: es })}</td>
                        <td className="py-2 text-right text-green-600 font-medium">+{fmt(dia.ingresos)}</td>
                        <td className="py-2 text-right text-red-600 font-medium">-{fmt(dia.egresos)}</td>
                        <td className={clsx('py-2 text-right font-bold', dia.saldo >= 0 ? 'text-gray-900' : 'text-red-600')}>
                          {dia.saldo >= 0 ? '+' : ''}{fmt(dia.saldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Costos por Producto Tab */}
      {tab === 'costos' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Análisis de Costos por Producto</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-3 font-medium">Producto</th>
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium text-right">Precio Venta</th>
                  <th className="pb-3 font-medium text-right">Costo Compra</th>
                  <th className="pb-3 font-medium text-right">Costo Materia Prima</th>
                  <th className="pb-3 font-medium text-right">Ganancia Unit.</th>
                  <th className="pb-3 font-medium text-right">Margen</th>
                  <th className="pb-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costos.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{c.nombre}</td>
                    <td className="py-3">
                      <span className="badge bg-gray-100 text-gray-700">{c.categoria}</span>
                    </td>
                    <td className="py-3 text-right">${c.precioVenta.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-500">${c.costoCompra.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-500">${c.costoMateriaPrima.toFixed(2)}</td>
                    <td className={clsx('py-3 text-right font-medium', c.gananciaUnitaria >= 0 ? 'text-green-600' : 'text-red-600')}>
                      ${c.gananciaUnitaria.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={clsx('font-medium', c.margen >= 50 ? 'text-green-600' : c.margen >= 20 ? 'text-yellow-600' : 'text-red-600')}>
                        {pct(c.margen)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-500">{c.stockActual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {costos.length === 0 && (
              <p className="text-center text-gray-400 py-8">No hay productos activos</p>
            )}
          </div>
        </div>
      )}

      {/* Ranking Tab */}
      {tab === 'ranking' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Top Productos por Ingresos</h3>
            {topProductos.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos en el período</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductos} layout="vertical">
                  <XAxis type="number" fontSize={11} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="nombre" type="category" width={140} fontSize={11} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString('es-AR')}`, 'Ingresos']} />
                  <Bar dataKey="ingresos" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Top Productos por Unidades</h3>
            {topProductos.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos en el período</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductos} layout="vertical">
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="nombre" type="category" width={140} fontSize={11} />
                  <Tooltip formatter={(v) => [`${v} unidades`, 'Vendidas']} />
                  <Bar dataKey="unidadesVendidas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Detalle de Ventas por Producto</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Producto</th>
                    <th className="pb-3 font-medium">Categoría</th>
                    <th className="pb-3 font-medium text-right">Unidades</th>
                    <th className="pb-3 font-medium text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProductos.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 font-medium text-gray-900">{p.nombre}</td>
                      <td className="py-3"><span className="badge bg-gray-100 text-gray-700">{p.categoria}</span></td>
                      <td className="py-3 text-right">{p.unidadesVendidas}</td>
                      <td className="py-3 text-right font-medium">${p.ingresos.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
