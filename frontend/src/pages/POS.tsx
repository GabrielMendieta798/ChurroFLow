import { useEffect, useState } from 'react';
import { cajaApi, clientesApi, productosApi, ventasApi } from '../api/endpoints';
import type { Caja, Cliente, MetodoPago, Producto } from '../types';
import { Plus, Minus, Trash2, ShoppingCart, AlertTriangle, User } from 'lucide-react';
import clsx from 'clsx';

interface CartItem {
  producto: Producto;
  cantidad: number;
  precioResuelto: number;
}

const CATEGORIAS: Record<string, string> = {
  CHURRO: 'Churros',
  DOCENA: 'Docenas',
  CAFE: 'Café',
  COMBO: 'Combos',
  BEBIDA: 'Bebidas',
  OTRO: 'Otros',
};

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
];

function resolvePrecio(producto: Producto, cliente?: Cliente | null): number {
  if (cliente?.listaPrecio?.items) {
    const item = cliente.listaPrecio.items.find((i) => i.productoId === producto.id);
    if (item) return Number(item.precio);
  }
  if (cliente?.tipo === 'MAYORISTA' && producto.precioMayorista) {
    return Number(producto.precioMayorista);
  }
  return Number(producto.precio);
}

export default function POS() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');
  const [busquedaCliente, setBusquedaCliente] = useState('');

  useEffect(() => {
    productosApi.getAll().then((r) => setProductos(r.data.filter((p) => p.activo)));
    clientesApi.getAll().then((r) => setClientes(r.data));
    cajaApi.getActual().then((r) => setCaja(r.data));
  }, []);

  const clientesFiltrados = busquedaCliente
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.cuit?.includes(busquedaCliente))
    : [];

  const selectCliente = (c: Cliente) => {
    setClienteSeleccionado(c);
    setBusquedaCliente('');
    setCart((prev) => prev.map((item) => ({
      ...item,
      precioResuelto: resolvePrecio(item.producto, c),
    })));
  };

  const clearCliente = () => {
    setClienteSeleccionado(null);
    setCart((prev) => prev.map((item) => ({
      ...item,
      precioResuelto: resolvePrecio(item.producto),
    })));
  };

  const categorias = ['TODOS', ...Array.from(new Set(productos.map((p) => p.categoria)))];

  const productosFiltrados = categoriaActiva === 'TODOS'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

  const addToCart = (producto: Producto) => {
    const precio = resolvePrecio(producto, clienteSeleccionado);
    setCart((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id);
      if (existing) {
        return prev.map((i) => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { producto, cantidad: 1, precioResuelto: precio }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.producto.id === id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter((i) => i.cantidad > 0),
    );
  };

  const total = cart.reduce((sum, i) => sum + i.precioResuelto * i.cantidad, 0);

  const handleVenta = async () => {
    if (!caja || cart.length === 0) return;
    setLoading(true);
    try {
      await ventasApi.create({
        cajaId: caja.id,
        clienteId: clienteSeleccionado?.id,
        metodoPago,
        items: cart.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioUnit: i.precioResuelto,
        })),
      });
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      alert('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (!caja) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle size={48} className="text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-700">No hay caja abierta</h2>
        <p className="text-gray-500">Abrí una caja en el módulo Caja para empezar a vender.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Productos */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Punto de Venta</h2>
            <div className="relative">
              <input
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className="input w-64 text-sm"
              />
              {busquedaCliente && clientesFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                  {clientesFiltrados.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCliente(c)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      <span className="font-medium">{c.nombre}</span>
                      <span className="text-gray-400 ml-2">{c.tipo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {clienteSeleccionado && (
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 mb-3 text-sm">
              <User size={14} className="text-brand-600" />
              <span className="font-medium text-brand-800">{clienteSeleccionado.nombre}</span>
              <span className="badge bg-brand-100 text-brand-700 text-xs">{clienteSeleccionado.tipo}</span>
              {clienteSeleccionado.listaPrecio && (
                <span className="text-xs text-brand-600">({clienteSeleccionado.listaPrecio.nombre})</span>
              )}
              <button onClick={clearCliente} className="ml-auto text-brand-400 hover:text-brand-700">✕</button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  categoriaActiva === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {cat === 'TODOS' ? 'Todos' : CATEGORIAS[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
          {productosFiltrados.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-brand-400 hover:shadow-md transition-all active:scale-95"
            >
              <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">{p.nombre}</p>
              <p className="text-xs text-gray-400 mb-2">{CATEGORIAS[p.categoria]}</p>
              <p className="text-brand-600 font-bold text-lg">
                ${resolvePrecio(p, clienteSeleccionado).toLocaleString('es-AR')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Pedido</h3>
            {cart.length > 0 && (
              <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                {cart.reduce((s, i) => s + i.cantidad, 0)} items
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Seleccioná productos</p>
          )}
          {cart.map(({ producto, cantidad, precioResuelto }) => (
            <div key={producto.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{producto.nombre}</p>
                <p className="text-xs text-gray-500">
                  ${precioResuelto.toLocaleString('es-AR')} c/u
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(producto.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{cantidad}</span>
                <button onClick={() => updateQty(producto.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
                  <Plus size={14} />
                </button>
                <button onClick={() => setCart((p) => p.filter((i) => i.producto.id !== producto.id))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 ml-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Subtotales */}
          {cart.map(({ producto, cantidad, precioResuelto }) => (
            <div key={producto.id} className="flex justify-between text-xs text-gray-500">
              <span>{producto.nombre} x{cantidad}</span>
              <span>${(precioResuelto * cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-brand-600">${total.toLocaleString('es-AR')}</span>
          </div>

          {/* Método de pago */}
          <div>
            <label className="label text-xs">Método de pago</label>
            <div className="grid grid-cols-3 gap-1">
              {METODOS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMetodoPago(m.value)}
                  className={clsx(
                    'py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                    metodoPago === m.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleVenta}
            disabled={loading || cart.length === 0}
            className={clsx(
              'w-full py-3 rounded-xl font-bold text-white transition-all',
              success ? 'bg-green-500' : 'bg-brand-600 hover:bg-brand-700',
            )}
          >
            {success ? '✓ Venta registrada' : loading ? 'Procesando...' : 'Confirmar Venta'}
          </button>

          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="w-full text-sm text-gray-400 hover:text-gray-600">
              Limpiar pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
