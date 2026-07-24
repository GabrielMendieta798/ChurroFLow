import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductosModule } from './productos/productos.module';
import { InsumosModule } from './insumos/insumos.module';
import { RecetasModule } from './recetas/recetas.module';
import { VentasModule } from './ventas/ventas.module';
import { CajaModule } from './caja/caja.module';
import { ComprasModule } from './compras/compras.module';
import { StockModule } from './stock/stock.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ClientesModule } from './clientes/clientes.module';
import { ListasPrecioModule } from './listas-precio/listas-precio.module';
import { DireccionesEntregaModule } from './direcciones-entrega/direcciones-entrega.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    AuthModule,
    UsersModule,
    ProductosModule,
    InsumosModule,
    RecetasModule,
    VentasModule,
    CajaModule,
    ComprasModule,
    StockModule,
    DashboardModule,
    ProveedoresModule,
    ClientesModule,
    ListasPrecioModule,
    DireccionesEntregaModule,
  ],
})
export class AppModule {}
