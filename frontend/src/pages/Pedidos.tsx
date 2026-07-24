import { useEffect, useState } from 'react';
import { pedidosApi, clientesApi, productosApi, direccionesEntregaApi } from '../api/endpoints';
import type { Cliente, EstadoPedido, Pedido, Producto, DireccionEntrega } from '../types';
import { Plus, Eye, X, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

const ESTADOS: { value: EstadoPedido; label: string; color: string }[] = [
  { value: 'BORRADOR', label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  { value: 'CONFIRMADO', label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  { value: 'PREPARANDO', label: 'Preparando', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LISTO', label: 'Listo', color: 'bg-green-100 text-green-700' },
  { value: 'EN_ENTREGA', label: 'En Entrega', color: 'bg-purple-100 text-purple-700' },
  { value: 'ENTREGADO', label: 'Entregado', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'CANCELADO', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
];

interface ItemForm {
  productoId: string;
  cantidad: string;
  precioUnit: string;
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailPedido, setDetailPedido] = useState<Pedido | null>(null);
  const [clienteId, setClienteId] = useState('');
  const [direccionEntregaId, setDireccionEntregaId] = useState('');
  const [direcciones, setDirecciones] = useState<DireccionEntrega[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ productoId: '', cantidad: '', precioUnit: '' }]);

  const load = () => {
    pedidosApi.getAll(filtroEstado || undefined).then((r) => setPedidos(r.data));
    clientesApi.getAll().then((r) => setClientes(r.data.filter((c) => c.activo)));
    productosApi.getAll().then((r) => setProductos(r.data.filter((p) => p.activo)));
  };
  useEffect(() => { load(); }, [filtroEstado]);

  const handleClienteChange = async (id: string) => {
    setClienteId(id);
    setDireccionEntregaId('');
    if (id) {
      const r = await direccionesEntregaApi.getByCliente(id);
      setDirecciones(r.data);
    } else {
      setDirecciones([]);
    }
  };

  const addItem = () => setItems([...items, { productoId: '', cantidad: '', precioUnit: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItemForm, value: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: value };
    if (field === 'productoId' && value) {
      const prod = productos.find((p) => p.id === value);
      if (prod) newItems[i].precioUnit = String(prod.precio);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || items.length === 0) return;
    await pedidosApi.create({
      clienteId,
      direccionEntregaId: direccionEntregaId || undefined,
      observaciones: observaciones || undefined,
      items: items.filter((i) => i.productoId && i.cantidad).map((i) => ({
        productoId: i.productoId,
        cantidad: Number(i.cantidad),
        precioUnit: Number(i.precioUnit),
      })),
    });
    setShowForm(false);
    resetForm();
    load();
  };

  const resetForm = () => {
    setClienteId('');
    setDireccionEntregaId('');
    setDirecciones([]);
    setObservaciones('');
    setItems([{ productoId: '', cantidad: '', precioUnit: '' }]);
  };

  const handleEstado = async (id: string, estado: string) => {
    if (!confirm(`¿Cambiar estado a "${ESTADOS.find((e) => e.value === estado)?.label}"?`)) return;
    try {
      await pedidosApi.updateEstado(id, estado);
      load();
      if (detailPedido?.id === id) {
        const r = await pedidosApi.getOne(id);
        setDetailPedido(r.data);
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al actualizar');
    }
  };

  const siguienteEstado = (estado: EstadoPedido): string | null => {
    const map: Record<string, string> = {
      BORRADOR: 'CONFIRMADO',
      CONFIRMADO: 'PREPARANDO',
      PREPARANDO: 'LISTO',
      LISTO: 'EN_ENTREGA',
      EN_ENTREGA: 'ENTREGADO',
    };
    return map[estado] || null;
  };

  const getEstado = (e: EstadoPedido) => ESTADOS.find((s) => s.value === e);

  const total = items.reduce((sum, i) => {
    const c = Number(i.cantidad) || 0;
    const p = Number(i.precioUnit) || 0;
    return sum + c * p;
  }, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Nuevo pedido
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nuevo pedido</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Cliente *</label>
                <select value={clienteId} onChange={(e) => handleClienteChange(e.target.value)} className="input" required>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>
                  ))}
                </select>
              </div>
              {direcciones.length > 0 && (
                <div>
                  <label className="label">Dirección de entrega</label>
                  <select value={direccionEntregaId} onChange={(e) => setDireccionEntregaId(e.target.value)} className="input">
                    <option value="">Sin dirección específica</option>
                    {direcciones.map((d) => (
                      <option key={d.id} value={d.id}>{d.alias}: {d.direccion}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="label">Observaciones</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input" rows={2} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Items *</label>
                  <button type="button" onClick={addItem} className="text-brand-600 text-sm font-medium hover:underline">+ Agregar item</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <select value={item.productoId} onChange={(e) => updateItem(i, 'productoId', e.target.value)} className="input flex-1" required>
                        <option value="">Producto...</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                        ))}
                      </select>
                      <input type="number" value={item.cantidad} onChange={(e) => updateItem(i, 'cantidad', e.target.value)} className="input w-20" placeholder="Cant." min="1" required />
                      <input type="number" value={item.precioUnit} onChange={(e) => updateItem(i, 'precioUnit', e.target.value)} className="input w-24" placeholder="Precio" step="0.01" min="0" required />
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 mt-2">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm font-medium text-gray-700 mt-2">Total: ${total.toFixed(2)}</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Crear pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailPedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{detailPedido.numero}</h3>
              <button onClick={() => setDetailPedido(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente</span>
                <span className="font-medium">{detailPedido.cliente.nombre}</span>
              </div>
              {detailPedido.direccionEntrega && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dirección</span>
                  <span className="font-medium text-right max-w-[60%]">{detailPedido.direccionEntrega.alias}: {detailPedido.direccionEntrega.direccion}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className={clsx('badge', getEstado(detailPedido.estado)?.color)}>
                  {getEstado(detailPedido.estado)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold">${Number(detailPedido.total).toFixed(2)}</span>
              </div>
              <hr />
              <p className="font-medium text-gray-700">Items:</p>
              {detailPedido.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.producto.nombre} x{item.cantidad}</span>
                  <span>${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              {detailPedido.observaciones && (
                <div>
                  <span className="text-gray-500">Observaciones:</span>
                  <p className="mt-1">{detailPedido.observaciones}</p>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Creado: {new Date(detailPedido.createdAt).toLocaleString('es-AR')}
              </div>
            </div>
            <div className="flex gap-2 mt-6 flex-wrap">
              {siguienteEstado(detailPedido.estado) && (
                <button
                  onClick={() => { const s = siguienteEstado(detailPedido.estado)!; setDetailPedido(null); handleEstado(detailPedido.id, s); }}
                  className="btn-primary flex-1 justify-center text-sm"
                >
                   <ChevronRight size={14} /> {getEstado(siguienteEstado(detailPedido.estado)! as EstadoPedido)?.label}
                </button>
              )}
              {!['ENTREGADO', 'CANCELADO'].includes(detailPedido.estado) && (
                <button
                  onClick={() => { setDetailPedido(null); handleEstado(detailPedido.id, 'CANCELADO'); }}
                  className="btn-danger flex-1 justify-center text-sm"
                >
                  <XCircle size={14} /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFiltroEstado('')} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', !filtroEstado ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600')}>
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button key={e.value} onClick={() => setFiltroEstado(e.value)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', filtroEstado === e.value ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600')}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {pedidos.length === 0 && (
          <p className="text-center text-gray-400 py-12">No hay pedidos</p>
        )}
        {pedidos.map((p) => (
          <div key={p.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{p.numero}</span>
                <span className={clsx('badge text-xs', getEstado(p.estado)?.color)}>
                  {getEstado(p.estado)?.label}
                </span>
                {p.reparto && (
                  <span className="badge text-xs bg-purple-100 text-purple-700">Reparto: {p.reparto.numero}</span>
                )}
              </div>
              <p className="font-medium text-gray-900">{p.cliente.nombre}</p>
              <p className="text-sm text-gray-500">
                {p.items.length} item(s) | Total: ${Number(p.total).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDetailPedido(p)} className="text-gray-400 hover:text-gray-700 p-2">
                <Eye size={16} />
              </button>
              {siguienteEstado(p.estado) && (
                <button
                  onClick={() => handleEstado(p.id, siguienteEstado(p.estado)!)}
                  className="text-green-500 hover:text-green-700 p-2"
                  title={`Avanzar a ${siguienteEstado(p.estado)}`}
                >
                  <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
