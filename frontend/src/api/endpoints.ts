import api from './client';
import type {
  Caja, Cliente, Compra, DashboardResumen, DireccionEntrega, Insumo, ListaPrecio,
  Producto, Proveedor, StockMovimiento, User, Venta,
} from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
};

// Productos
export const productosApi = {
  getAll: () => api.get<Producto[]>('/productos'),
  getOne: (id: string) => api.get<Producto>(`/productos/${id}`),
  create: (data: Partial<Producto>) => api.post<Producto>('/productos', data),
  update: (id: string, data: Partial<Producto>) => api.put<Producto>(`/productos/${id}`, data),
  remove: (id: string) => api.delete(`/productos/${id}`),
  toggleActivo: (id: string) => api.patch<Producto>(`/productos/${id}/toggle`),
  resolvePrice: (productoId: string, clienteId?: string) => {
    const params = new URLSearchParams({ productoId });
    if (clienteId) params.append('clienteId', clienteId);
    return api.get<number>(`/productos/pricing?${params}`);
  },
};

// Insumos
export const insumosApi = {
  getAll: () => api.get<Insumo[]>('/insumos'),
  create: (data: Partial<Insumo>) => api.post<Insumo>('/insumos', data),
  update: (id: string, data: Partial<Insumo>) => api.put<Insumo>(`/insumos/${id}`, data),
  remove: (id: string) => api.delete(`/insumos/${id}`),
};

// Recetas
export const recetasApi = {
  getAll: () => api.get('/recetas'),
  upsert: (data: { productoId: string; items: { insumoId: string; cantidad: number }[] }) =>
    api.post('/recetas', data),
  getByProducto: (productoId: string) => api.get(`/recetas/producto/${productoId}`),
  remove: (productoId: string) => api.delete(`/recetas/producto/${productoId}`),
};

// Ventas
export const ventasApi = {
  getAll: (fechaDesde?: string, fechaHasta?: string) => {
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);
    return api.get<Venta[]>(`/ventas?${params}`);
  },
  create: (data: {
    cajaId: string;
    clienteId?: string;
    items: { productoId: string; cantidad: number; precioUnit: number }[];
    metodoPago: string;
    observaciones?: string;
  }) => api.post<Venta>('/ventas', data),
};

// Caja
export const cajaApi = {
  getAll: () => api.get<Caja[]>('/caja'),
  getActual: () => api.get<Caja | null>('/caja/actual'),
  getOne: (id: string) => api.get<Caja>(`/caja/${id}`),
  abrir: (montoInicial: number) => api.post<Caja>('/caja/abrir', { montoInicial }),
  cerrar: (id: string, montoFinalReal: number, observaciones?: string) =>
    api.post<Caja>(`/caja/${id}/cerrar`, { montoFinalReal, observaciones }),
  addMovimiento: (cajaId: string, data: { tipo: string; concepto: string; monto: number }) =>
    api.post(`/caja/${cajaId}/movimiento`, data),
};

// Compras
export const comprasApi = {
  getAll: () => api.get<Compra[]>('/compras'),
  create: (data: {
    proveedorId: string;
    items: { insumoId: string; cantidad: number; costoUnit: number }[];
    observaciones?: string;
  }) => api.post<Compra>('/compras', data),
};

// Stock
export const stockApi = {
  getMovimientos: (insumoId?: string) =>
    api.get<StockMovimiento[]>(`/stock/movimientos${insumoId ? `?insumoId=${insumoId}` : ''}`),
  getBajoStock: () => api.get<Insumo[]>('/stock/bajo-stock'),
  ajustar: (data: { insumoId: string; tipo: string; cantidad: number; motivo?: string }) =>
    api.post('/stock/ajuste', data),
};

// Dashboard
export const dashboardApi = {
  getHoy: () => api.get<DashboardResumen>('/dashboard/hoy'),
  getPeriodo: (desde: string, hasta: string) =>
    api.get(`/dashboard/ventas-periodo?desde=${desde}&hasta=${hasta}`),
};

// Proveedores
export const proveedoresApi = {
  getAll: () => api.get<Proveedor[]>('/proveedores'),
  create: (data: Partial<Proveedor>) => api.post<Proveedor>('/proveedores', data),
  update: (id: string, data: Partial<Proveedor>) => api.put<Proveedor>(`/proveedores/${id}`, data),
};

// Users
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
};

// Clientes
export const clientesApi = {
  getAll: () => api.get<Cliente[]>('/clientes'),
  getOne: (id: string) => api.get<Cliente>(`/clientes/${id}`),
  create: (data: Partial<Cliente>) => api.post<Cliente>('/clientes', data),
  update: (id: string, data: Partial<Cliente>) => api.put<Cliente>(`/clientes/${id}`, data),
  remove: (id: string) => api.delete(`/clientes/${id}`),
};

// Listas de Precio
export const listasPrecioApi = {
  getAll: () => api.get<ListaPrecio[]>('/listas-precio'),
  getOne: (id: string) => api.get<ListaPrecio>(`/listas-precio/${id}`),
  create: (data: { nombre: string; descripcion?: string; items: { productoId: string; precio: number }[] }) =>
    api.post<ListaPrecio>('/listas-precio', data),
  update: (id: string, data: { nombre?: string; descripcion?: string; items?: { productoId: string; precio: number }[] }) =>
    api.put<ListaPrecio>(`/listas-precio/${id}`, data),
  remove: (id: string) => api.delete(`/listas-precio/${id}`),
};

// Direcciones de Entrega
export const direccionesEntregaApi = {
  getByCliente: (clienteId: string) => api.get<DireccionEntrega[]>(`/direcciones-entrega?clienteId=${clienteId}`),
  getOne: (id: string) => api.get<DireccionEntrega>(`/direcciones-entrega/${id}`),
  create: (data: Partial<DireccionEntrega>) => api.post<DireccionEntrega>('/direcciones-entrega', data),
  update: (id: string, data: Partial<DireccionEntrega>) => api.put<DireccionEntrega>(`/direcciones-entrega/${id}`, data),
  remove: (id: string) => api.delete(`/direcciones-entrega/${id}`),
};
