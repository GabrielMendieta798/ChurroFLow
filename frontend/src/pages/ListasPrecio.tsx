import { useEffect, useState } from 'react';
import { listasPrecioApi, productosApi } from '../api/endpoints';
import type { ListaPrecio, Producto } from '../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface ItemRow {
  productoId: string;
  precio: string;
}

interface Form {
  nombre: string;
  descripcion: string;
  items: ItemRow[];
}

const empty: Form = { nombre: '', descripcion: '', items: [] };

export default function ListasPrecio() {
  const [listas, setListas] = useState<ListaPrecio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const [l, p] = await Promise.all([listasPrecioApi.getAll(), productosApi.getAll()]);
    setListas(l.data);
    setProductos(p.data.filter((p) => p.activo));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      items: form.items
        .filter((i) => i.productoId && i.precio)
        .map((i) => ({ productoId: i.productoId, precio: Number(i.precio) })),
    };
    if (editId) await listasPrecioApi.update(editId, data);
    else await listasPrecioApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (l: ListaPrecio) => {
    setForm({
      nombre: l.nombre,
      descripcion: l.descripcion || '',
      items: l.items.map((i) => ({ productoId: i.productoId, precio: String(i.precio) })),
    });
    setEditId(l.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta lista de precio?')) return;
    await listasPrecioApi.remove(id);
    load();
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productoId: '', precio: '' }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listas de Precio</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }} className="btn-primary">
          <Plus size={18} /> Nueva lista
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Editar' : 'Nueva'} lista de precio</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Productos y precios</label>
                  <button type="button" onClick={addItem} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                    + Agregar producto
                  </button>
                </div>
                {form.items.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No hay productos. Hacé click en "+ Agregar producto".</p>
                )}
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={item.productoId}
                        onChange={(e) => updateItem(idx, 'productoId', e.target.value)}
                        className="input flex-1"
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre} (${Number(p.precio).toFixed(2)})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.precio}
                        onChange={(e) => updateItem(idx, 'precio', e.target.value)}
                        className="input w-32"
                        placeholder="Precio"
                        step="0.01"
                        min="0"
                        required
                      />
                      <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {listas.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{l.nombre}</h3>
                {l.descripcion && <p className="text-sm text-gray-500">{l.descripcion}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-gray-100 text-gray-600">
                  {l.clientes?.length || 0} cliente{(l.clientes?.length || 0) !== 1 ? 's' : ''}
                </span>
                <button onClick={() => handleEdit(l)} className="text-gray-400 hover:text-gray-700">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(l.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {l.items.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium text-right">Precio lista</th>
                    <th className="pb-2 font-medium text-right">Precio base</th>
                    <th className="pb-2 font-medium text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {l.items.map((item) => {
                    const diff = Number(item.precio) - Number(item.producto.precio);
                    return (
                      <tr key={item.id}>
                        <td className="py-2 text-sm text-gray-900">{item.producto.nombre}</td>
                        <td className="py-2 text-sm text-right font-mono font-bold">${Number(item.precio).toFixed(2)}</td>
                        <td className="py-2 text-sm text-right text-gray-500 font-mono">${Number(item.producto.precio).toFixed(2)}</td>
                        <td className={`py-2 text-sm text-right font-mono ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 py-2">Sin productos configurados</p>
            )}
          </div>
        ))}
        {listas.length === 0 && (
          <div className="card">
            <p className="text-center text-gray-400 py-8">No hay listas de precio configuradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
