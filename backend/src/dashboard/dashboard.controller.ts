import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('hoy')
  getResumenHoy() {
    return this.dashboardService.getResumenHoy();
  }

  @Get('ventas-periodo')
  getVentasPorPeriodo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.dashboardService.getVentasPorPeriodo(desde, hasta);
  }
}
