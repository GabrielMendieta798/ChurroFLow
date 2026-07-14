import { useEffect, useState } from 'react';
import { insumosApi } from '../api/endpoints';
import type { Insumo, UnidadMedida } from '../types';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const UNIDADES: UnidadMedida[] = ['GRAMO', 'KILOGRAMO', 'MILILITRO', 'LITRO', 'UNIDAD'];
const UND_LABELS: Record<UnidadMedida, string> = {
  GRAMO: 'g', KILOGRAMO: 'kg', MILILITRO: 'ml', LITRO: 'L', UNIDAD: 'u',
};

interface Form {
  nombre: string;
  unidad: UnidadMedida;
  stockActual: string;
  stockMinimo: string;
  costoUnitario: string;
}

const empty: Form = { nombre: '', unidad: 'GRAMO', stockActual: '0', stockMinimo: '0', costoUnitario: '0' };

export default function Insumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => insumosApi.getAll().then((r) => setInsumos(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre,
      unidad: form.unidad,
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
      costoUnitario: Number(form.costoUnitario),
    };
    if (editId) await insumosApi.update(editId, data);
    else await insumosApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (i: Insumo) => {
    setForm({
      nombre: i.nombre,
      unidad: i.unidad,
      stockActual: String(i.stockActual),
      stockMinimo: String(i.stockMinimo),
      costoUnitario: String(i.costoUnitario),
    });
    setEditId(i.id);
    setShowForm(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Insumos</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }} className="btn-primary">
          <Plus size={18} /> Nuevo insumo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} insumo</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Unidad de medida</label>
                <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value as UnidadMedida })} className="input">
                  {UNIDADES.map((u) => <option key={u} value={u}>{u} ({UND_LABELS[u]})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Stock actual</label>
                  <input type="number" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: e.target.value })} className="input" step="0.001" />
                </div>
                <div>
                  <label className="label">Stock mínimo</label>
                  <input type="number" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} className="input" step="0.001" />
                </div>
              </div>
              <div>
                <label className="label">Costo unitario ($/{'{'}unidad{'}'})</label>
                <input type="number" value={form.costoUnitario} onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })} className="input" step="0.0001" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-3 font-medium">Nombre</th>
              <th className="pb-3 font-medium">Unidad</th>
              <th className="pb-3 font-medium text-right">Stock actual</th>
              <th className="pb-3 font-medium text-right">Stock mínimo</th>
              <th className="pb-3 font-medium text-right">Costo unit.</th>
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {insumos.map((i) => {
              const bajo = Number(i.stockActual) <= Number(i.stockMinimo);
              return (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{i.nombre}</td>
                  <td className="py-3 text-sm text-gray-500">{i.unidad}</td>
                  <td className={clsx('py-3 text-right font-mono text-sm', bajo ? 'text-red-600 font-bold' : 'text-gray-700')}>
                    {Number(i.stockActual).toFixed(1)} {UND_LABELS[i.unidad]}
                  </td>
                  <td className="py-3 text-right text-sm text-gray-500">
                    {Number(i.stockMinimo).toFixed(1)} {UND_LABELS[i.unidad]}
                  </td>
                  <td className="py-3 text-right text-sm text-gray-500">
                    ${Number(i.costoUnitario).toFixed(4)}
                  </td>
                  <td className="py-3">
                    {bajo && (
                      <span className="badge bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                        <AlertTriangle size={10} /> Bajo
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleEdit(i)} className="text-gray-400 hover:text-gray-700">
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
