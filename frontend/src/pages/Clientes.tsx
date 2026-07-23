import { useEffect, useState } from 'react';
import { clientesApi } from '../api/endpoints';
import type { Cliente, TipoCliente } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TIPOS: TipoCliente[] = ['MINORISTA', 'MAYORISTA'];

interface Form {
  nombre: string;
  cuit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo: TipoCliente;
  notas: string;
}

const empty: Form = { nombre: '', cuit: '', contacto: '', telefono: '', email: '', direccion: '', tipo: 'MINORISTA', notas: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => clientesApi.getAll().then((r) => setClientes(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<Cliente> = {
      nombre: form.nombre,
      tipo: form.tipo,
    };
    if (form.cuit) data.cuit = form.cuit;
    if (form.contacto) data.contacto = form.contacto;
    if (form.telefono) data.telefono = form.telefono;
    if (form.email) data.email = form.email;
    if (form.direccion) data.direccion = form.direccion;
    if (form.notas) data.notas = form.notas;
    if (editId) await clientesApi.update(editId, data);
    else await clientesApi.create(data);
    setShowForm(false);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (c: Cliente) => {
    setForm({
      nombre: c.nombre,
      cuit: c.cuit || '',
      contacto: c.contacto || '',
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || '',
      tipo: c.tipo,
      notas: c.notas || '',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await clientesApi.remove(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }} className="btn-primary">
          <Plus size={18} /> Nuevo cliente
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Editar' : 'Nuevo'} cliente</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CUIT</label>
                  <input value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} className="input" placeholder="20-12345678-9" />
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCliente })} className="input">
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Contacto</label>
                <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Teléfono</label>
                  <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="input" rows={2} />
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
              <th className="pb-3 font-medium">CUIT</th>
              <th className="pb-3 font-medium">Tipo</th>
              <th className="pb-3 font-medium">Contacto</th>
              <th className="pb-3 font-medium">Teléfono</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{c.nombre}</td>
                <td className="py-3 text-sm text-gray-500 font-mono">{c.cuit || '-'}</td>
                <td className="py-3">
                  <span className={`badge ${c.tipo === 'MAYORISTA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {c.tipo}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-500">{c.contacto || '-'}</td>
                <td className="py-3 text-sm text-gray-500">{c.telefono || '-'}</td>
                <td className="py-3 text-sm text-gray-500">{c.email || '-'}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-gray-700">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay clientes registrados</p>
        )}
      </div>
    </div>
  );
}
