import { useEffect, useState } from 'react';
import { insumosApi, productosApi, recetasApi } from '../api/endpoints';
import type { Insumo, Producto } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';

interface RecetaItemForm {
  insumoId: string;
  cantidad: string;
}

export default function Recetas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [productoId, setProductoId] = useState('');
  const [items, setItems] = useState<RecetaItemForm[]>([{ insumoId: '', cantidad: '' }]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    productosApi.getAll().then((r) => setProductos(r.data));
    insumosApi.getAll().then((r) => setInsumos(r.data));
  }, []);

  const handleProductoChange = async (id: string) => {
    setProductoId(id);
    if (!id) return setItems([{ insumoId: '', cantidad: '' }]);
    const { data } = await recetasApi.getByProducto(id);
    if (data?.items?.length) {
      setItems(data.items.map((i: any) => ({ insumoId: i.insumoId, cantidad: String(i.cantidad) })));
    } else {
      setItems([{ insumoId: '', cantidad: '' }]);
    }
  };

  const addItem = () => setItems((p) => [...p, { insumoId: '', cantidad: '' }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof RecetaItemForm, value: string) =>
    setItems((p) => p.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const handleSave = async () => {
    if (!productoId) return;
    const validItems = items.filter((i) => i.insumoId && i.cantidad);
    if (!validItems.length) return;
    setSaving(true);
    try {
      await recetasApi.upsert({
        productoId,
        items: validItems.map((i) => ({ insumoId: i.insumoId, cantidad: Number(i.cantidad) })),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      // Reload productos to update recipe count
      productosApi.getAll().then((r) => setProductos(r.data));
    } finally {
      setSaving(false);
    }
  };

  const productoSeleccionado = productos.find((p) => p.id === productoId);

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recetas</h2>

      <div className="card mb-6">
        <label className="label">Seleccioná un producto</label>
        <select value={productoId} onChange={(e) => handleProductoChange(e.target.value)} className="input max-w-md">
          <option value="">-- Seleccioná --</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.receta ? '✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {productoId && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">
            Receta: {productoSeleccionado?.nombre}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Definí qué insumos y cantidades consume cada unidad de este producto
          </p>

          <div className="space-y-3 mb-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <select
                  value={item.insumoId}
                  onChange={(e) => updateItem(idx, 'insumoId', e.target.value)}
                  className="input flex-1"
                >
                  <option value="">-- Insumo --</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} ({i.unidad})
                    </option>
                  ))}
                </select>
                <div className="relative w-36">
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                    className="input pr-12"
                    placeholder="Cantidad"
                    step="0.001"
                    min="0"
                  />
                  {item.insumoId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {insumos.find((i) => i.id === item.insumoId)?.unidad}
                    </span>
                  )}
                </div>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600" disabled={items.length === 1}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={addItem} className="btn-secondary">
              <Plus size={16} /> Agregar insumo
            </button>
            <button onClick={handleSave} disabled={saving} className={success ? 'btn bg-green-600 text-white' : 'btn-primary'}>
              <Save size={16} /> {success ? 'Guardado!' : saving ? 'Guardando...' : 'Guardar receta'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos con receta */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Productos con receta</h3>
        <div className="space-y-2">
          {productos.filter((p) => p.receta).map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{p.nombre}</h4>
                <button onClick={() => handleProductoChange(p.id)} className="text-sm text-brand-600 hover:underline">
                  Editar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.receta?.items.map((item) => (
                  <span key={item.id} className="badge bg-gray-100 text-gray-600">
                    {item.insumo.nombre}: {Number(item.cantidad).toFixed(1)}{item.insumo.unidad}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
