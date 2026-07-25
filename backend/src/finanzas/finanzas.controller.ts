import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('finanzas')
export class FinanzasController {
  constructor(private finanzasService: FinanzasService) {}

  @Get('resumen')
  getResumen(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.finanzasService.getResumen(fechaDesde, fechaHasta);
  }

  @Get('flujo-caja')
  getFlujoCaja(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.finanzasService.getFlujoCaja(fechaDesde, fechaHasta);
  }

  @Get('costos-producto')
  getCostosPorProducto() {
    return this.finanzasService.getCostosPorProducto();
  }

  @Get('top-productos')
  getTopProductos(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('limit') limit?: string,
  ) {
    return this.finanzasService.getTopProductos(fechaDesde, fechaHasta, limit ? +limit : 10);
  }
}
