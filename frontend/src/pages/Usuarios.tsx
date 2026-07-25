import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserRound } from 'lucide-react';
import { usersApi } from '../api/endpoints';
import type { Role, User } from '../types';

interface UserForm {
  nombre: string;
  email: string;
  password: string;
  role: Exclude<Role, 'DEMO'>;
}

const emptyForm: UserForm = { nombre: '', email: '', password: '', role: 'EMPLEADO' };

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await usersApi.getAll();
      setUsers(data);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await usersApi.create(form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleUser = async (user: User) => {
    const action = user.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Querés ${action} a ${user.nombre}?`)) return;
    setError('');
    try {
      await usersApi.toggleActivo(user.id);
      await load();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || `No se pudo ${action} el usuario`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <p className="mt-1 text-sm text-gray-500">Administrá quién puede acceder al sistema y con qué permisos.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }} className="btn-primary">
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Nuevo usuario</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Contraseña temporal *</label>
                <input className="input" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <p className="mt-1 text-xs text-gray-500">Usá al menos 8 caracteres y compartila por un medio seguro.</p>
              </div>
              <div>
                <label className="label">Perfil</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserForm['role'] })}>
                  <option value="EMPLEADO">Empleado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="pb-3 font-medium">Usuario</th>
              <th className="pb-3 font-medium">Perfil</th>
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-4">
                  <p className="font-medium text-gray-900">{user.nombre}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </td>
                <td className="py-4">
                  <span className={`badge inline-flex items-center gap-1 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'DEMO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role === 'ADMIN' ? <ShieldCheck size={13} /> : <UserRound size={13} />}
                    {user.role}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`badge ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button onClick={() => toggleUser(user)} className={user.activo ? 'text-sm font-medium text-red-600 hover:text-red-700' : 'text-sm font-medium text-green-600 hover:text-green-700'}>
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && <p className="py-8 text-center text-gray-400">No hay usuarios registrados</p>}
        {loading && <p className="py-8 text-center text-gray-400">Cargando usuarios...</p>}
      </div>
    </div>
  );
}
