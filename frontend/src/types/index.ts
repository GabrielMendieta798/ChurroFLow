export type Role = 'ADMIN' | 'EMPLEADO';
export type Categoria = 'CHURRO' | 'DOCENA' | 'CAFE' | 'COMBO' | 'BEBIDA' | 'OTRO';
export type UnidadMedida = 'GRAMO' | 'KILOGRAMO' | 'MILILITRO' | 'LITRO' | 'UNIDAD';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADO_PAGO';
export type EstadoCaja = 'ABIERTA' | 'CERRADA';
export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';
export type TipoMovimientoStock = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PERDIDA';

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
