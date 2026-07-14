import { useEffect, useState } from 'react';
import { comprasApi, insumosApi, proveedoresApi } from '../api/endpoints';
import type { Compra, Insumo, Proveedor } from '../types';
import { Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface CompraItemForm {
  insumoId: string;
  cantidad: string;
  costoUnit: string;
}

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [items, setItems] = useState<CompraItemForm[]>([{ insumoId: '', cantidad: '', costoUnit: '' }]);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  // Nuevo proveedor inline
  const [showNewProv, setShowNewProv] = useState(false);
  const [newProvNombre, setNewProvNombre] = useState('');

  const load = async () => {
    const [c, i, p] = await Promise.all([comprasApi.getAll(), insumosApi.getAll(), proveedoresApi.getAll()]);
    setCompras(c.data);
    setInsumos(i.data);
    setProveedores(p.data);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems((p) => [...p, { insumoId: '', cantidad: '', costoUnit: '' }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof CompraItemForm, value: string) =>
    setItems((p) => p.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const totalForm = items.reduce((s, i) => s + (Number(i.cantidad) * Number(i.costoUnit) || 0), 0);

  const handleSave = async () => {
    if (!proveedorId) return alert('Seleccioná un proveedor');
    const validItems = items.filter((i) => i.insumoId && i.cantidad && i.costoUnit);
    if (!validItems.length) return alert('Agregá al menos un item');
    setSaving(true);
    try {
      await comprasApi.create({
        proveedorId,
        items: validItems.map((i) => ({
          insumoId: i.insumoId,
          cantidad: Number(i.cantidad),
          costoUnit: Number(i.costoUnit),
        })),
        observaciones,
      });
      setShowForm(false);
      setItems([{ insumoId: '', cantidad: '', costoUnit: '' }]);
      setProveedorId('');
      setObservaciones('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleCrearProveedor = async () => {
    if (!newProvNombre) return;
    const { data } = await proveedoresApi.create({ nombre: newProvNombre });
    setProveedores((p) => [...p, data]);
    setProveedorId(data.id);
    setNewProvNombre('');
    setShowNewProv(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Compras</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Nueva compra
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Registrar compra</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Proveedor</label>
                <div className="flex gap-2">
                  <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="input flex-1">
                    <option value="">-- Seleccioná --</option>
                    {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <button onClick={() => setShowNewProv(!showNewProv)} className="btn-secondary whitespace-nowrap">
                    + Nuevo
                  </button>
                </div>
                {showNewProv && (
                  <div className="flex gap-2 mt-2">
                    <input value={newProvNombre} onChange={(e) => setNewProvNombre(e.target.value)} className="input flex-1" placeholder="Nombre del proveedor" />
                    <button onClick={handleCrearProveedor} className="btn-primary">Crear</button>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Items</label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={item.insumoId}
                        onChange={(e) => updateItem(idx, 'insumoId', e.target.value)}
                        className="input col-span-5"
                      >
                        <option value="">-- Insumo --</option>
                        {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
                      </select>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                        placeholder="Cantidad"
                        className="input col-span-3"
                        step="0.001" min="0"
                      />
                      <input
                        type="number"
                        value={item.costoUnit}
                        onChange={(e) => updateItem(idx, 'costoUnit', e.target.value)}
                        placeholder="Costo unit."
                        className="input col-span-3"
                        step="0.01" min="0"
                      />
                      <button onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center" disabled={items.length === 1}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="btn-secondary mt-2 text-sm">
                  <Plus size={14} /> Agregar item
                </button>
              </div>

              <div>
                <label className="label">Observaciones (opcional)</label>
                <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input" />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-bold text-lg">Total: ${totalForm.toLocaleString('es-AR')}</span>
                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? 'Guardando...' : 'Registrar compra'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Proveedor</th>
              <th className="pb-3 font-medium">Items</th>
              <th className="pb-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {compras.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 text-sm text-gray-600">{format(new Date(c.fecha), 'dd/MM/yyyy HH:mm')}</td>
                <td className="py-3 text-sm font-medium">{c.proveedor.nombre}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.items.map((item, i) => (
                      <span key={i} className="badge bg-gray-100 text-gray-600">
                        {Number(item.cantidad).toFixed(0)} {item.insumo.unidad} {item.insumo.nombre}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 text-right font-bold">${Number(c.total).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {compras.length === 0 && (
          <p className="text-center py-8 text-gray-400">No hay compras registradas</p>
        )}
      </div>
    </div>
  );
}
