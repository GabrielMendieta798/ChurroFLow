import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { AjusteStockDto } from './dto/ajuste-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('movimientos')
  findMovimientos(@Query('insumoId') insumoId?: string) {
    return this.stockService.findMovimientos(insumoId);
  }

  @Get('bajo-stock')
  findBajoStock() {
    return this.stockService.findBajoStock();
  }

  @Post('ajuste')
  ajustar(@Body() dto: AjusteStockDto) {
    return this.stockService.ajustar(dto);
  }
}
