import { useEffect, useState } from 'react';
import { ventasApi } from '../api/endpoints';
import type { MetodoPago, Venta } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const METODO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  MERCADO_PAGO: 'Mercado Pago',
};

const METODO_COLORS: Record<MetodoPago, string> = {
  EFECTIVO: 'bg-green-100 text-green-700',
  TRANSFERENCIA: 'bg-blue-100 text-blue-700',
  MERCADO_PAGO: 'bg-sky-100 text-sky-700',
};

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'));

  const load = () => {
    setLoading(true);
    ventasApi.getAll(fechaDesde, fechaHasta + 'T23:59:59')
      .then((r) => setVentas(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const total = ventas.reduce((s, v) => s + Number(v.total), 0);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ventas</h2>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="input w-auto" />
          </div>
          <button onClick={load} className="btn-primary">Filtrar</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{ventas.length}</p>
          <p className="text-sm text-gray-500 mt-1">Ventas</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-600">${total.toLocaleString('es-AR')}</p>
          <p className="text-sm text-gray-500 mt-1">Total facturado</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">
            ${ventas.length > 0 ? Math.round(total / ventas.length).toLocaleString('es-AR') : '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ticket promedio</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-3 font-medium">Fecha y hora</th>
                <th className="pb-3 font-medium">Empleado</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Productos</th>
                <th className="pb-3 font-medium">Método</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-600">
                    {format(new Date(v.fecha), "dd/MM HH:mm")}
                  </td>
                  <td className="py-3 text-sm">{v.empleado.nombre}</td>
                  <td className="py-3 text-sm">
                    {v.cliente ? (
                      <div>
                        <span className="font-medium text-gray-900">{v.cliente.nombre}</span>
                        <span className={`ml-1 badge text-xs ${v.cliente.tipo === 'MAYORISTA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {v.cliente.tipo === 'MINORISTA' ? 'Min' : 'May'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.items.map((item) => (
                        <span key={item.id} className="badge bg-gray-100 text-gray-600">
                          {item.cantidad}x {item.producto.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={clsx('badge', METODO_COLORS[v.metodoPago])}>
                      {METODO_LABELS[v.metodoPago]}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-gray-900">
                    ${Number(v.total).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventas.length === 0 && (
            <p className="text-center py-8 text-gray-400">No hay ventas en el período seleccionado</p>
          )}
        </div>
      )}
    </div>
  );
}
