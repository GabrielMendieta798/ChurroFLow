import { useEffect, useState } from 'react';
import { produccionApi, productosApi } from '../api/endpoints';
import type { EstadoProduccion, OrdenProduccion, Producto } from '../types';
import { Plus, Play, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import clsx from 'clsx';

const ESTADOS: { value: EstadoProduccion; label: string; color: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'EN_PROCESO', label: 'En Proceso', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLETADA', label: 'Completada', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELADA', label: 'Cancelada', color: 'bg-red-100 text-red-700' },
];

export default function Produccion() {
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detailOrden, setDetailOrden] = useState<OrdenProduccion | null>(null);

  const load = () => {
    produccionApi.getAll(filtroEstado || undefined).then((r) => setOrdenes(r.data));
    productosApi.getAll().then((r) => setProductos(r.data.filter((p) => p.activo)));
  };
  useEffect(() => { load(); }, [filtroEstado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId || !cantidad) return;
    await produccionApi.create({ productoId, cantidad: Number(cantidad), observaciones: observaciones || undefined });
    setShowForm(false);
    setProductoId('');
    setCantidad('');
    setObservaciones('');
    load();
  };

  const handleEstado = async (id: string, estado: string) => {
    const msg = estado === 'COMPLETADA'
      ? '¿Completar esta orden? Se descontarán los insumos y aumentará el stock del producto.'
      : estado === 'CANCELADA'
        ? '¿Cancelar esta orden?'
        : `¿Cambiar estado a "${ESTADOS.find((e) => e.value === estado)?.label}"?`;
    if (!confirm(msg)) return;
    try {
      await produccionApi.updateEstado(id, estado);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al actualizar');
    }
  };

  const getEstado = (e: EstadoProduccion) => ESTADOS.find((s) => s.value === e);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Producción</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Nueva orden
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nueva orden de producción</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Producto *</label>
                <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="input" required>
                  <option value="">Seleccionar producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (stock: {p.stockActual})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Cantidad a producir *</label>
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="input" required min="1" />
              </div>
              <div>
                <label className="label">Observaciones</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input" rows={2} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Crear orden</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{detailOrden.numero}</h3>
              <button onClick={() => setDetailOrden(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Producto</span>
                <span className="font-medium">{detailOrden.producto.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cantidad</span>
                <span className="font-medium">{detailOrden.cantidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className={clsx('badge', getEstado(detailOrden.estado)?.color)}>
                  {getEstado(detailOrden.estado)?.label}
                </span>
              </div>
              {detailOrden.producto.receta && (
                <>
                  <hr />
                  <p className="font-medium text-gray-700">Insumos necesarios:</p>
                  {detailOrden.producto.receta.items.map((item) => {
                    const total = Number(item.cantidad) * detailOrden.cantidad;
                    const disponible = Number(item.insumo.stockActual);
                    const suficiente = disponible >= total;
                    return (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span>{item.insumo.nombre}</span>
                        <span className={suficiente ? 'text-green-600' : 'text-red-600'}>
                          {total} {item.insumo.unidad} (disp: {disponible})
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
              {detailOrden.observaciones && (
                <div>
                  <span className="text-gray-500">Observaciones:</span>
                  <p className="mt-1">{detailOrden.observaciones}</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>Creada: {new Date(detailOrden.createdAt).toLocaleString('es-AR')}</span>
                {detailOrden.fechaFin && <span>Finalizada: {new Date(detailOrden.fechaFin).toLocaleString('es-AR')}</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              {detailOrden.estado === 'PENDIENTE' && (
                <button onClick={() => { setDetailOrden(null); handleEstado(detailOrden.id, 'EN_PROCESO'); }} className="btn-primary flex-1 justify-center text-sm">
                  <Play size={14} /> Iniciar
                </button>
              )}
              {detailOrden.estado === 'EN_PROCESO' && (
                <button onClick={() => { setDetailOrden(null); handleEstado(detailOrden.id, 'COMPLETADA'); }} className="btn-primary flex-1 justify-center text-sm bg-green-600 hover:bg-green-700">
                  <CheckCircle size={14} /> Completar
                </button>
              )}
              {(detailOrden.estado === 'PENDIENTE' || detailOrden.estado === 'EN_PROCESO') && (
                <button onClick={() => { setDetailOrden(null); handleEstado(detailOrden.id, 'CANCELADA'); }} className="btn-danger flex-1 justify-center text-sm">
                  <XCircle size={14} /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFiltroEstado('')} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', !filtroEstado ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600')}>
          Todas
        </button>
        {ESTADOS.map((e) => (
          <button key={e.value} onClick={() => setFiltroEstado(e.value)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', filtroEstado === e.value ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600')}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {ordenes.length === 0 && (
          <p className="text-center text-gray-400 py-12">No hay órdenes de producción</p>
        )}
        {ordenes.map((o) => (
          <div key={o.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{o.numero}</span>
                <span className={clsx('badge text-xs', getEstado(o.estado)?.color)}>
                  {getEstado(o.estado)?.label}
                </span>
              </div>
              <p className="font-medium text-gray-900">{o.producto.nombre}</p>
              <p className="text-sm text-gray-500">
                Cantidad: {o.cantidad} | Stock actual: {o.producto.stockActual}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDetailOrden(o)} className="text-gray-400 hover:text-gray-700 p-2">
                <Eye size={16} />
              </button>
              {o.estado === 'PENDIENTE' && (
                <button onClick={() => handleEstado(o.id, 'EN_PROCESO')} className="text-blue-500 hover:text-blue-700 p-2" title="Iniciar">
                  <Play size={16} />
                </button>
              )}
              {o.estado === 'EN_PROCESO' && (
                <button onClick={() => handleEstado(o.id, 'COMPLETADA')} className="text-green-500 hover:text-green-700 p-2" title="Completar">
                  <CheckCircle size={16} />
                </button>
              )}
              {(o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO') && (
                <button onClick={() => handleEstado(o.id, 'CANCELADA')} className="text-red-400 hover:text-red-600 p-2" title="Cancelar">
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
