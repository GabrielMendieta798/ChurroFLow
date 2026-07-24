import { useEffect, useState } from 'react';
import { direccionesEntregaApi } from '../api/endpoints';
import type { DireccionEntrega } from '../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Props {
  clienteId: string;
  onClose: () => void;
}

interface Form {
  alias: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  notas: string;
}

const empty: Form = { alias: '', direccion: '', barrio: '', ciudad: '', notas: '' };

export default function DireccionesEntrega({ clienteId, onClose }: Props) {
  const [direcciones, setDirecciones] = useState<DireccionEntrega[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => direccionesEntregaApi.getByCliente(clienteId).then((r) => setDirecciones(r.data));
  useEffect(() => { load(); }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, clienteId, barrio: form.barrio || undefined, ciudad: form.ciudad || undefined, notas: form.notas || undefined };
    if (editId) await direccionesEntregaApi.update(editId, data);
    else await direccionesEntregaApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (d: DireccionEntrega) => {
    setForm({ alias: d.alias, direccion: d.direccion, barrio: d.barrio || '', ciudad: d.ciudad || '', notas: d.notas || '' });
    setEditId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    await direccionesEntregaApi.remove(id);
    load();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Direcciones de Entrega</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }} className="btn-primary text-sm py-1.5">
              <Plus size={14} /> Nueva
            </button>
            <button onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div>
              <label className="label">Alias *</label>
              <input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} className="input" required placeholder="Ej: Sucursal Centro" />
            </div>
            <div>
              <label className="label">Dirección *</label>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Barrio</label>
                <input value={form.barrio} onChange={(e) => setForm({ ...form, barrio: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Notas</label>
              <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="input" placeholder="Ej: Timbre azul, preguntar por Juan" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {direcciones.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">No hay direcciones registradas</p>
          )}
          {direcciones.map((d) => (
            <div key={d.id} className="border border-gray-200 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{d.alias}</p>
                  <p className="text-sm text-gray-600">{d.direccion}</p>
                  {(d.barrio || d.ciudad) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {[d.barrio, d.ciudad].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {d.notas && <p className="text-xs text-gray-400 mt-1 italic">{d.notas}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(d)} className="text-gray-400 hover:text-gray-700 p-1">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
