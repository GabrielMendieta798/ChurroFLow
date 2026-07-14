import { useEffect, useState } from 'react';
import { productosApi } from '../api/endpoints';
import type { Categoria, Producto } from '../types';
import { Plus, Pencil, X } from 'lucide-react';

const CATEGORIAS: Categoria[] = ['CHURRO', 'DOCENA', 'CAFE', 'COMBO', 'BEBIDA', 'OTRO'];
const CAT_LABELS: Record<Categoria, string> = {
  CHURRO: 'Churro', DOCENA: 'Docena', CAFE: 'Café', COMBO: 'Combo', BEBIDA: 'Bebida', OTRO: 'Otro',
};

interface Form {
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: Categoria;
}

const empty: Form = { nombre: '', descripcion: '', precio: '', categoria: 'CHURRO' };

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => productosApi.getAll().then((r) => setProductos(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, precio: Number(form.precio) };
    if (editId) await productosApi.update(editId, data);
    else await productosApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (p: Producto) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? '', precio: String(p.precio), categoria: p.categoria });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deshabilitar este producto?')) return;
    await productosApi.remove(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }} className="btn-primary">
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} producto</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Descripción (opcional)</label>
                <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Precio ($)</label>
                <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="input" required min="0" />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria })} className="input">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                <span className="badge bg-brand-100 text-brand-700 mt-1">{CAT_LABELS[p.categoria]}</span>
              </div>
              <p className="text-xl font-bold text-brand-600">${Number(p.precio).toLocaleString('es-AR')}</p>
            </div>
            {p.descripcion && <p className="text-sm text-gray-500 mb-3">{p.descripcion}</p>}
            {p.receta && (
              <p className="text-xs text-green-600 mb-3">
                Receta: {p.receta.items.length} insumos
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEdit(p)} className="btn-secondary flex-1 justify-center text-sm py-1.5">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => handleDelete(p.id)} className="btn-danger flex-1 justify-center text-sm py-1.5">
                <X size={14} /> Deshabilitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
