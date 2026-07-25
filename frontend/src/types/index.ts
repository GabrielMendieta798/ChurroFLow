export type Role = 'ADMIN' | 'EMPLEADO';
export type Categoria = 'CHURRO' | 'DOCENA' | 'CAFE' | 'COMBO' | 'BEBIDA' | 'OTRO';
export type UnidadMedida = 'GRAMO' | 'KILOGRAMO' | 'MILILITRO' | 'LITRO' | 'UNIDAD';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADO_PAGO';
export type EstadoCaja = 'ABIERTA' | 'CERRADA';
export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';
export type TipoMovimientoStock = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PERDIDA';
export type TipoCliente = 'MINORISTA' | 'MAYORISTA';

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  activo: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioCompra?: number;
  precioMayorista?: number;
  margen?: number;
  stockActual: number;
  stockMinimo: number;
  categoria: Categoria;
  activo: boolean;
  receta?: Receta;
}

export interface Insumo {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  activo: boolean;
}

export interface RecetaItem {
  id: string;
  insumoId: string;
  insumo: Insumo;
  cantidad: number;
}

export interface Receta {
  id: string;
  productoId: string;
  items: RecetaItem[];
}

export interface VentaItem {
  id: string;
  productoId: string;
  producto: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  empleado: { nombre: string };
  cliente?: { id: string; nombre: string; tipo: TipoCliente };
  cajaId: string;
  items: VentaItem[];
  total: number;
  metodoPago: MetodoPago;
  observaciones?: string;
  fecha: string;
}

export interface MovimientoCaja {
  id: string;
  tipo: TipoMovimientoCaja;
  concepto: string;
  monto: number;
  fecha: string;
}

export interface Caja {
  id: string;
  fechaApertura: string;
  fechaCierre?: string;
  montoInicial: number;
  montoFinalReal?: number;
  montoEsperado?: number;
  diferencia?: number;
  estado: EstadoCaja;
  observaciones?: string;
  ventas?: Venta[];
  movimientos?: MovimientoCaja[];
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  cuit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipo: TipoCliente;
  notas?: string;
  activo: boolean;
  listaPrecioId?: string;
  listaPrecio?: ListaPrecio;
  direcciones?: DireccionEntrega[];
}

export interface DireccionEntrega {
  id: string;
  clienteId: string;
  alias: string;
  direccion: string;
  barrio?: string;
  ciudad?: string;
  notas?: string;
  activo: boolean;
}

export interface ListaPrecioItem {
  id: string;
  productoId: string;
  producto: Producto;
  precio: number;
}

export interface ListaPrecio {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  items: ListaPrecioItem[];
  clientes?: { id: string; nombre: string }[];
}

export interface CompraItem {
  insumoId: string;
  insumo: Insumo;
  cantidad: number;
  costoUnit: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  proveedor: Proveedor;
  items: CompraItem[];
  total: number;
  fecha: string;
  observaciones?: string;
}

export interface StockMovimiento {
  id: string;
  insumo: Insumo;
  tipo: TipoMovimientoStock;
  cantidad: number;
  motivo?: string;
  fecha: string;
}

export interface DashboardResumen {
  fecha: string;
  cajaActual: Caja | null;
  ventas: {
    cantidad: number;
    total: number;
    porMetodoPago: Record<MetodoPago, number>;
  };
  compras: {
    cantidad: number;
    total: number;
  };
  gananciaEstimada: number;
  productosMasVendidos: { nombre: string; cantidad: number; total: number }[];
  insumosBajoStock: Insumo[];
}

export type EstadoProduccion = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
export type EstadoPedido = 'BORRADOR' | 'CONFIRMADO' | 'PREPARANDO' | 'LISTO' | 'EN_ENTREGA' | 'ENTREGADO' | 'CANCELADO';
export type EstadoReparto = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO';

export interface OrdenProduccion {
  id: string;
  numero: string;
  productoId: string;
  producto: Producto;
  cantidad: number;
  estado: EstadoProduccion;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt: string;
}

export interface PedidoItem {
  id: string;
  productoId: string;
  producto: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  numero: string;
  clienteId: string;
  cliente: { id: string; nombre: string; tipo: TipoCliente };
  direccionEntregaId?: string;
  direccionEntrega?: DireccionEntrega;
  estado: EstadoPedido;
  observaciones?: string;
  fechaEntrega?: string;
  reparto?: { id: string; numero: string };
  items: PedidoItem[];
  total: number;
  createdAt: string;
}

export interface ZonaReparto {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Reparto {
  id: string;
  numero: string;
  zonaReparto?: ZonaReparto;
  estado: EstadoReparto;
  fecha: string;
  observaciones?: string;
  pedidos: Pedido[];
  createdAt: string;
}

export interface ResumenFinanciero {
  periodo: { desde: string; hasta: string };
  ingresos: { ventas: number; pedidos: number; otros: number; total: number };
  egresos: { compras: number; otros: number; total: number };
  gananciaNeta: number;
  margen: number;
  cantidadVentas: number;
  cantidadPedidos: number;
  ticketPromedio: number;
}

export interface FlujoCajaDia {
  fecha: string;
  ingresos: number;
  egresos: number;
  saldo: number;
}

export interface CostoProducto {
  id: string;
  nombre: string;
  categoria: Categoria;
  precioVenta: number;
  costoCompra: number;
  costoMateriaPrima: number;
  gananciaUnitaria: number;
  margen: number;
  stockActual: number;
}

export interface TopProducto {
  id: string;
  nombre: string;
  categoria: Categoria;
  unidadesVendidas: number;
  ingresos: number;
}
