import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/endpoints';
import type { DashboardResumen } from '../types';
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Package, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getHoy().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!data) return null;

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">
          {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {data.cajaActual ? (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Wallet size={20} className="text-green-600" />
          <span className="text-green-800 font-medium">
            Caja abierta desde {format(new Date(data.cajaActual.fechaApertura), 'HH:mm')} hs · Fondo inicial: {fmt(data.cajaActual.montoInicial)}
          </span>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600" />
          <span className="text-yellow-800 font-medium">No hay caja abierta. Abrí una en el módulo Caja.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Ventas del día" value={data.ventas.cantidad.toString()} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard label="Facturación" value={fmt(data.ventas.total)} icon={TrendingUp} color="bg-brand-500" />
        <StatCard label="Gastos" value={fmt(data.compras.total)} icon={DollarSign} color="bg-red-500" />
        <StatCard label="Ganancia estimada" value={fmt(data.gananciaEstimada)} icon={Package} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Productos más vendidos */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Productos más vendidos hoy</h3>
          {data.productosMasVendidos.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin ventas aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.productosMasVendidos} layout="vertical">
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="nombre" type="category" width={150} fontSize={11} />
                <Tooltip formatter={(v) => [`${v} unidades`, 'Cantidad']} />
                <Bar dataKey="cantidad" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Ventas por método de pago</h3>
          <div className="space-y-3">
            {Object.entries(data.ventas.porMetodoPago).map(([metodo, total]) => (
              <div key={metodo} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {metodo === 'EFECTIVO' ? 'Efectivo' : metodo === 'TRANSFERENCIA' ? 'Transferencia' : 'Mercado Pago'}
                </span>
                <span className="font-semibold">{fmt(total as number)}</span>
              </div>
            ))}
            {Object.keys(data.ventas.porMetodoPago).length === 0 && (
              <p className="text-gray-400 text-sm">Sin ventas aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Bajo stock */}
      {data.insumosBajoStock.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-900">Insumos bajo stock mínimo</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.insumosBajoStock.map((i) => (
              <div key={i.id} className="bg-white rounded-lg p-3 border border-red-200">
                <p className="font-medium text-sm text-gray-900">{i.nombre}</p>
                <p className="text-xs text-red-600">
                  Stock: {Number(i.stockActual).toFixed(0)} {i.unidad} · Mínimo: {Number(i.stockMinimo).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
