import { useEffect, useState } from 'react';
import { cajaApi } from '../api/endpoints';
import type { Caja } from '../types';
import { Wallet, Plus, Minus, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

export default function CajaPage() {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [historial, setHistorial] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [obscierre, setObsCierre] = useState('');
  const [movConcepto, setMovConcepto] = useState('');
  const [movMonto, setMovMonto] = useState('');
  const [movTipo, setMovTipo] = useState<'INGRESO' | 'EGRESO'>('INGRESO');

  const load = async () => {
    const [actual, todas] = await Promise.all([cajaApi.getActual(), cajaApi.getAll()]);
    setCaja(actual.data);
    setHistorial(todas.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAbrir = async () => {
    if (!montoInicial) return;
    await cajaApi.abrir(Number(montoInicial));
    setMontoInicial('');
    load();
  };

  const handleCerrar = async () => {
    if (!caja || !montoFinal) return;
    await cajaApi.cerrar(caja.id, Number(montoFinal), obscierre);
    setMontoFinal('');
    setObsCierre('');
    load();
  };

  const handleMovimiento = async () => {
    if (!caja || !movConcepto || !movMonto) return;
    await cajaApi.addMovimiento(caja.id, { tipo: movTipo, concepto: movConcepto, monto: Number(movMonto) });
    setMovConcepto('');
    setMovMonto('');
    load();
  };

  const fmt = (n?: number) => n != null ? `$${Number(n).toLocaleString('es-AR')}` : '-';

  const totalVentas = caja?.ventas?.reduce((s, v) => s + Number(v.total), 0) ?? 0;
  const totalIngresos = caja?.movimientos?.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + Number(m.monto), 0) ?? 0;
  const totalEgresos = caja?.movimientos?.filter((m) => m.tipo === 'EGRESO').reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Caja</h2>

      {!caja ? (
        <div className="card max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Unlock size={18} /> Abrir caja
          </h3>
          <div className="space-y-3">
            <div>
              <label className="label">Fondo inicial ($)</label>
              <input
                type="number"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="input"
                placeholder="0"
              />
            </div>
            <button onClick={handleAbrir} className="btn-primary w-full justify-center">
              Abrir caja
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estado actual */}
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Caja Abierta</h3>
                <p className="text-green-700 text-sm">
                  Desde {format(new Date(caja.fechaApertura), "HH:mm 'hs del' d/MM/yyyy")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Fondo inicial</p>
                <p className="font-bold text-lg">{fmt(caja.montoInicial)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ventas</p>
                <p className="font-bold text-lg text-green-700">{fmt(totalVentas)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ingresos extra</p>
                <p className="font-bold text-lg text-blue-700">{fmt(totalIngresos)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Egresos</p>
                <p className="font-bold text-lg text-red-700">{fmt(totalEgresos)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-gray-600">
                Efectivo esperado en caja:{' '}
                <span className="font-bold text-lg text-gray-900">
                  {fmt(Number(caja.montoInicial) + totalVentas + totalIngresos - totalEgresos)}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registrar movimiento */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Registrar movimiento</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMovTipo('INGRESO')}
                    className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                      movTipo === 'INGRESO' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600')}
                  >
                    <Plus size={16} /> Ingreso
                  </button>
                  <button
                    onClick={() => setMovTipo('EGRESO')}
                    className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                      movTipo === 'EGRESO' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600')}
                  >
                    <Minus size={16} /> Egreso
                  </button>
                </div>
                <div>
                  <label className="label">Concepto</label>
                  <input value={movConcepto} onChange={(e) => setMovConcepto(e.target.value)} className="input" placeholder="Ej: Pago a proveedor" />
                </div>
                <div>
                  <label className="label">Monto ($)</label>
                  <input type="number" value={movMonto} onChange={(e) => setMovMonto(e.target.value)} className="input" placeholder="0" />
                </div>
                <button onClick={handleMovimiento} className="btn-primary w-full justify-center">
                  Registrar
                </button>
              </div>
            </div>

            {/* Cierre de caja */}
            <div className="card border-red-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={18} /> Cerrar caja
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Dinero real en caja ($)</label>
                  <input type="number" value={montoFinal} onChange={(e) => setMontoFinal(e.target.value)} className="input" placeholder="Contá el efectivo" />
                </div>
                <div>
                  <label className="label">Observaciones (opcional)</label>
                  <input value={obscierre} onChange={(e) => setObsCierre(e.target.value)} className="input" placeholder="Notas del cierre..." />
                </div>
                <button onClick={handleCerrar} className="btn-danger w-full justify-center">
                  Cerrar caja del día
                </button>
              </div>
            </div>
          </div>

          {/* Movimientos */}
          {(caja.movimientos?.length ?? 0) > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Movimientos de caja</h3>
              <div className="divide-y">
                {caja.movimientos?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{m.concepto}</p>
                      <p className="text-xs text-gray-400">{format(new Date(m.fecha), 'HH:mm')}</p>
                    </div>
                    <span className={clsx('font-semibold', m.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600')}>
                      {m.tipo === 'INGRESO' ? '+' : '-'}{fmt(m.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="mt-8 card">
        <h3 className="font-semibold text-gray-900 mb-4">Historial de cajas</h3>
        <div className="divide-y">
          {historial.filter((c) => c.estado === 'CERRADA').slice(0, 10).map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(c.fechaApertura), 'dd/MM/yyyy')}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(c.fechaApertura), 'HH:mm')} - {c.fechaCierre ? format(new Date(c.fechaCierre), 'HH:mm') : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{fmt(c.montoFinalReal)}</p>
                <p className={clsx('text-xs', (c.diferencia ?? 0) >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {(c.diferencia ?? 0) >= 0 ? '+' : ''}{fmt(c.diferencia)} diferencia
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
