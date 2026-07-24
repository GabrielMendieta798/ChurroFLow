import { useEffect, useState } from 'react';
import { productosApi } from '../api/endpoints';
import type { Categoria, Producto } from '../types';
import { Plus, Pencil, X, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIAS: Categoria[] = ['CHURRO', 'DOCENA', 'CAFE', 'COMBO', 'BEBIDA', 'OTRO'];
const CAT_LABELS: Record<Categoria, string> = {
  CHURRO: 'Churro', DOCENA: 'Docena', CAFE: 'Café', COMBO: 'Combo', BEBIDA: 'Bebida', OTRO: 'Otro',
};

interface Form {
  nombre: string;
  descripcion: string;
  precio: string;
  precioCompra: string;
  precioMayorista: string;
  margen: string;
  stockMinimo: string;
  categoria: Categoria;
}

const empty: Form = { nombre: '', descripcion: '', precio: '', precioCompra: '', precioMayorista: '', margen: '', stockMinimo: '', categoria: 'CHURRO' };

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Producto | null>(null);

  const load = () => productosApi.getAll().then((r) => setProductos(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      precio: Number(form.precio),
      precioCompra: form.precioCompra ? Number(form.precioCompra) : undefined,
      precioMayorista: form.precioMayorista ? Number(form.precioMayorista) : undefined,
      margen: form.margen ? Number(form.margen) : undefined,
      stockMinimo: form.stockMinimo ? Number(form.stockMinimo) : 0,
    };
    if (editId) await productosApi.update(editId, data);
    else await productosApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (p: Producto) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: String(p.precio),
      precioCompra: p.precioCompra != null ? String(p.precioCompra) : '',
      precioMayorista: p.precioMayorista != null ? String(p.precioMayorista) : '',
      margen: p.margen != null ? String(p.margen) : '',
      stockMinimo: String(p.stockMinimo),
      categoria: p.categoria,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleToggle = async (id: string) => {
    await productosApi.toggleActivo(id);
    load();
  };

  const fmt = (v?: number | null) =>
    v != null ? `$${Number(v).toLocaleString('es-AR')}` : '—';

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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                <label className="label">Categoría</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria })} className="input">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Precio de compra ($)</label>
                <input type="number" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Margen (%)</label>
                <input type="number" value={form.margen} onChange={(e) => setForm({ ...form, margen: e.target.value })} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Precio de venta minorista ($)</label>
                <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="input" required min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Precio de venta mayorista ($)</label>
                <input type="number" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Stock mínimo</label>
                <input type="number" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} className="input" min="0" step="1" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{detailProduct.nombre}</h3>
              <button onClick={() => setDetailProduct(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Categoría</span><span className="badge bg-brand-100 text-brand-700">{CAT_LABELS[detailProduct.categoria]}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Estado</span><span className={detailProduct.activo ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{detailProduct.activo ? 'Activo' : 'Inactivo'}</span></div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Precio de compra</span><span className="font-medium">{fmt(detailProduct.precioCompra)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Margen</span><span className="font-medium">{detailProduct.margen != null ? `${detailProduct.margen}%` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Precio venta minorista</span><span className="font-bold text-brand-600">{fmt(detailProduct.precio)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Precio venta mayorista</span><span className="font-bold text-brand-600">{fmt(detailProduct.precioMayorista)}</span></div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-500">Stock actual</span>
                <span className={`font-bold ${detailProduct.stockActual <= detailProduct.stockMinimo && detailProduct.stockMinimo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {detailProduct.stockActual}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Stock mínimo</span><span className="font-medium">{detailProduct.stockMinimo}</span></div>
              {detailProduct.descripcion && (
                <>
                  <hr />
                  <div><span className="text-gray-500">Descripción:</span><p className="mt-1">{detailProduct.descripcion}</p></div>
                </>
              )}
              {detailProduct.receta && (
                <>
                  <hr />
                  <div>
                    <span className="text-gray-500">Receta ({detailProduct.receta.items.length} insumos)</span>
                    <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                      {detailProduct.receta.items.map((item) => (
                        <li key={item.id}>{item.insumo.nombre}: {item.cantidad} {item.insumo.unidad}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setDetailProduct(null); handleEdit(detailProduct); }} className="btn-secondary flex-1 justify-center">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => { setDetailProduct(null); handleToggle(detailProduct.id); }} className="btn-primary flex-1 justify-center">
                {detailProduct.activo ? <><ToggleRight size={14} /> Deshabilitar</> : <><ToggleLeft size={14} /> Habilitar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((p) => (
          <div key={p.id} className={`card ${!p.activo ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                  {!p.activo && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Inactivo</span>}
                </div>
                <span className="badge bg-brand-100 text-brand-700 mt-1">{CAT_LABELS[p.categoria]}</span>
              </div>
              <p className="text-xl font-bold text-brand-600">{fmt(p.precio)}</p>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5 mb-3">
              {p.precioCompra != null && <p>Compra: {fmt(p.precioCompra)}</p>}
              {p.margen != null && <p>Margen: {p.margen}%</p>}
              {p.precioMayorista != null && <p>Mayorista: {fmt(p.precioMayorista)}</p>}
              <p className={p.stockActual <= p.stockMinimo && p.stockMinimo > 0 ? 'text-red-600 font-medium' : ''}>
                Stock: {p.stockActual} (mín: {p.stockMinimo})
              </p>
            </div>
            {p.descripcion && <p className="text-sm text-gray-500 mb-3">{p.descripcion}</p>}
            {p.receta && (
              <p className="text-xs text-green-600 mb-3">
                Receta: {p.receta.items.length} insumos
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setDetailProduct(p)} className="btn-secondary flex-1 justify-center text-sm py-1.5">
                <Eye size={14} /> Ver
              </button>
              <button onClick={() => handleEdit(p)} className="btn-secondary flex-1 justify-center text-sm py-1.5">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => handleToggle(p.id)} className={`${p.activo ? 'btn-danger' : 'btn-primary'} flex-1 justify-center text-sm py-1.5`}>
                {p.activo ? <><ToggleRight size={14} /> Off</> : <><ToggleLeft size={14} /> On</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
