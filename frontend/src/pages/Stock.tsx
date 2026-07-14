import { useEffect, useState } from 'react';
import { insumosApi, stockApi } from '../api/endpoints';
import type { Insumo, StockMovimiento, TipoMovimientoStock } from '../types';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Plus } from 'lucide-react';

const TIPO_LABELS: Record<TipoMovimientoStock, string> = {
  ENTRADA: 'Entrada', SALIDA: 'Salida', AJUSTE: 'Ajuste', PERDIDA: 'Pérdida',
};
const TIPO_COLORS: Record<TipoMovimientoStock, string> = {
  ENTRADA: 'bg-green-100 text-green-700',
  SALIDA: 'bg-red-100 text-red-700',
  AJUSTE: 'bg-blue-100 text-blue-700',
  PERDIDA: 'bg-orange-100 text-orange-700',
};

export default function Stock() {
  const [movimientos, setMovimientos] = useState<StockMovimiento[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [insumoFiltro, setInsumoFiltro] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ insumoId: '', tipo: 'AJUSTE' as TipoMovimientoStock, cantidad: '', motivo: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [m, i] = await Promise.all([
      stockApi.getMovimientos(insumoFiltro || undefined),
      insumosApi.getAll(),
    ]);
    setMovimientos(m.data);
    setInsumos(i.data);
  };

  useEffect(() => { load(); }, [insumoFiltro]);

  const handleAjuste = async () => {
    if (!form.insumoId || !form.cantidad) return;
    setSaving(true);
    try {
      await stockApi.ajustar({ ...form, cantidad: Number(form.cantidad) });
      setShowForm(false);
      setForm({ insumoId: '', tipo: 'AJUSTE', cantidad: '', motivo: '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Control de Stock</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Ajuste manual
        </button>
      </div>

      {/* Stock actual */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Stock actual</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {insumos.map((i) => {
            const bajo = Number(i.stockActual) <= Number(i.stockMinimo);
            return (
              <div key={i.id} className={clsx('rounded-xl p-3 border', bajo ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200')}>
                <p className={clsx('text-sm font-medium', bajo ? 'text-red-900' : 'text-gray-900')}>{i.nombre}</p>
                <p className={clsx('text-lg font-bold', bajo ? 'text-red-700' : 'text-gray-700')}>
                  {Number(i.stockActual).toFixed(1)}
                  <span className="text-xs font-normal ml-1">{i.unidad}</span>
                </p>
                <p className="text-xs text-gray-400">Mín: {Number(i.stockMinimo).toFixed(0)}</p>
                {bajo && <span className="text-xs text-red-600 font-medium">BAJO STOCK</span>}
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Ajuste de stock</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Insumo</label>
                <select value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: e.target.value })} className="input">
                  <option value="">-- Seleccioná --</option>
                  {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre} (actual: {Number(i.stockActual).toFixed(1)} {i.unidad})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo de movimiento</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMovimientoStock })} className="input">
                  <option value="AJUSTE">Ajuste (corrección inventario)</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SALIDA">Salida</option>
                  <option value="PERDIDA">Pérdida / desperdicio</option>
                </select>
              </div>
              <div>
                <label className="label">Cantidad</label>
                <input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} className="input" step="0.001" min="0" />
              </div>
              <div>
                <label className="label">Motivo (opcional)</label>
                <input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="input" placeholder="Ej: Vencimiento, rotura..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button onClick={handleAjuste} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movimientos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Movimientos recientes</h3>
          <select value={insumoFiltro} onChange={(e) => setInsumoFiltro(e.target.value)} className="input w-auto text-sm">
            <option value="">Todos los insumos</option>
            {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Insumo</th>
              <th className="pb-3 font-medium">Tipo</th>
              <th className="pb-3 font-medium text-right">Cantidad</th>
              <th className="pb-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="py-2 text-sm text-gray-500">{format(new Date(m.fecha), 'dd/MM HH:mm')}</td>
                <td className="py-2 text-sm font-medium">{m.insumo.nombre}</td>
                <td className="py-2">
                  <span className={clsx('badge', TIPO_COLORS[m.tipo])}>{TIPO_LABELS[m.tipo]}</span>
                </td>
                <td className="py-2 text-right font-mono text-sm">
                  {Number(m.cantidad).toFixed(1)} {m.insumo.unidad}
                </td>
                <td className="py-2 text-sm text-gray-400">{m.motivo ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.length === 0 && (
          <p className="text-center py-8 text-gray-400">No hay movimientos</p>
        )}
      </div>
    </div>
  );
}
