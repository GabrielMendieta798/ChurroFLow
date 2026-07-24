import { useEffect, useState } from 'react';
import { repartosApi, zonasRepartoApi, pedidosApi } from '../api/endpoints';
import type { EstadoReparto, Pedido, Reparto, ZonaReparto } from '../types';
import { Plus, Eye, X, ChevronRight, Truck, Package } from 'lucide-react';
import clsx from 'clsx';

const ESTADOS: { value: EstadoReparto; label: string; color: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'EN_CURSO', label: 'En Curso', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLETADO', label: 'Completado', color: 'bg-green-100 text-green-700' },
];

export default function Repartos() {
  const [repartos, setRepartos] = useState<Reparto[]>([]);
  const [zonas, setZonas] = useState<ZonaReparto[]>([]);
  const [pedidosListos, setPedidosListos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [detailReparto, setDetailReparto] = useState<Reparto | null>(null);
  const [zonaRepartoId, setZonaRepartoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedPedidos, setSelectedPedidos] = useState<string[]>([]);

  const load = () => {
    repartosApi.getAll(filtroEstado || undefined).then((r) => setRepartos(r.data));
    zonasRepartoApi.getAll().then((r) => setZonas(r.data));
  };
  useEffect(() => { load(); }, [filtroEstado]);

  const loadPedidosListos = async () => {
    const r = await pedidosApi.getAll('LISTO');
    setPedidosListos(r.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await repartosApi.create({
      zonaRepartoId: zonaRepartoId || undefined,
      observaciones: observaciones || undefined,
      pedidoIds: selectedPedidos.length > 0 ? selectedPedidos : undefined,
    });
    setShowForm(false);
    setZonaRepartoId('');
    setObservaciones('');
    setSelectedPedidos([]);
    load();
  };

  const handleAssign = async (repartoId: string) => {
    if (selectedPedidos.length === 0) return;
    await repartosApi.assignPedidos(repartoId, selectedPedidos);
    setShowAssign(null);
    setSelectedPedidos([]);
    load();
  };

  const handleEstado = async (id: string, estado: string) => {
    const msg = estado === 'COMPLETADO'
      ? '¿Completar este reparto? Los pedidos marcados como "En Entrega" pasarán a "Entregado".'
      : `¿Cambiar estado a "${ESTADOS.find((e) => e.value === estado)?.label}"?`;
    if (!confirm(msg)) return;
    try {
      await repartosApi.updateEstado(id, estado);
      load();
      if (detailReparto?.id === id) {
        const r = await repartosApi.getOne(id);
        setDetailReparto(r.data);
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al actualizar');
    }
  };

  const siguienteEstado = (estado: EstadoReparto): string | null => {
    const map: Record<string, string> = {
      PENDIENTE: 'EN_CURSO',
      EN_CURSO: 'COMPLETADO',
    };
    return map[estado] || null;
  };

  const getEstado = (e: EstadoReparto) => ESTADOS.find((s) => s.value === e);

  const openAssign = async (repartoId: string) => {
    setShowAssign(repartoId);
    setSelectedPedidos([]);
    await loadPedidosListos();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Repartos</h2>
        <button onClick={() => { setShowForm(true); loadPedidosListos(); }} className="btn-primary">
          <Plus size={18} /> Nuevo reparto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Nuevo reparto</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Zona de reparto</label>
                <select value={zonaRepartoId} onChange={(e) => setZonaRepartoId(e.target.value)} className="input">
                  <option value="">Sin zona específica</option>
                  {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Observaciones</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input" rows={2} />
              </div>
              <div>
                <label className="label mb-2">Pedidos listos para asignar (opcional)</label>
                {pedidosListos.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay pedidos listos para entrega</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {pedidosListos.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedPedidos.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPedidos([...selectedPedidos, p.id]);
                            else setSelectedPedidos(selectedPedidos.filter((id) => id !== p.id));
                          }}
                          className="rounded"
                        />
                        <span className="font-mono text-xs text-gray-400">{p.numero}</span>
                        <span className="flex-1">{p.cliente.nombre}</span>
                        <span className="text-gray-500">${Number(p.total).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Crear reparto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Asignar pedidos</h3>
              <button onClick={() => { setShowAssign(null); setSelectedPedidos([]); }}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Seleccioná los pedidos listos para agregar al reparto:</p>
            {pedidosListos.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay pedidos listos</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pedidosListos.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedPedidos.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPedidos([...selectedPedidos, p.id]);
                        else setSelectedPedidos(selectedPedidos.filter((id) => id !== p.id));
                      }}
                      className="rounded"
                    />
                    <span className="font-mono text-xs text-gray-400">{p.numero}</span>
                    <span className="flex-1">{p.cliente.nombre}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowAssign(null); setSelectedPedidos([]); }} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={() => handleAssign(showAssign)} className="btn-primary flex-1 justify-center" disabled={selectedPedidos.length === 0}>
                Asignar ({selectedPedidos.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {detailReparto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{detailReparto.numero}</h3>
              <button onClick={() => setDetailReparto(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className={clsx('badge', getEstado(detailReparto.estado)?.color)}>
                  {getEstado(detailReparto.estado)?.label}
                </span>
              </div>
              {detailReparto.zonaReparto && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Zona</span>
                  <span className="font-medium">{detailReparto.zonaReparto.nombre}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Pedidos</span>
                <span className="font-medium">{detailReparto.pedidos.length}</span>
              </div>
              <hr />
              {detailReparto.pedidos.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-gray-400">{p.numero}</span>
                    <span className="ml-2">{p.cliente.nombre}</span>
                  </div>
                  <span className={clsx('badge text-xs', p.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700')}>
                    {p.estado}
                  </span>
                </div>
              ))}
              {detailReparto.observaciones && (
                <div>
                  <span className="text-gray-500">Observaciones:</span>
                  <p className="mt-1">{detailReparto.observaciones}</p>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Fecha: {new Date(detailReparto.fecha).toLocaleString('es-AR')}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              {siguienteEstado(detailReparto.estado) && (
                <button
                  onClick={() => { const s = siguienteEstado(detailReparto.estado)!; setDetailReparto(null); handleEstado(detailReparto.id, s); }}
                  className="btn-primary flex-1 justify-center text-sm"
                >
                   <ChevronRight size={14} /> {getEstado(siguienteEstado(detailReparto.estado)! as EstadoReparto)?.label}
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
        {repartos.length === 0 && (
          <p className="text-center text-gray-400 py-12">No hay repartos</p>
        )}
        {repartos.map((r) => (
          <div key={r.id} className="card flex items-center gap-4">
            <div className="flex-shrink-0">
              <Truck size={24} className="text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{r.numero}</span>
                <span className={clsx('badge text-xs', getEstado(r.estado)?.color)}>
                  {getEstado(r.estado)?.label}
                </span>
                {r.zonaReparto && (
                  <span className="badge text-xs bg-gray-100 text-gray-600">{r.zonaReparto.nombre}</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                <Package size={12} className="inline mr-1" />
                {r.pedidos.length} pedido(s)
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDetailReparto(r)} className="text-gray-400 hover:text-gray-700 p-2">
                <Eye size={16} />
              </button>
              {r.estado === 'PENDIENTE' && (
                <button onClick={() => openAssign(r.id)} className="text-blue-500 hover:text-blue-700 p-2" title="Asignar pedidos">
                  <Package size={16} />
                </button>
              )}
              {siguienteEstado(r.estado) && (
                <button
                  onClick={() => handleEstado(r.id, siguienteEstado(r.estado)!)}
                  className="text-green-500 hover:text-green-700 p-2"
                  title={`Avanzar a ${siguienteEstado(r.estado)}`}
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
