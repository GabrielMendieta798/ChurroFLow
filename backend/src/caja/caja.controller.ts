import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto, CerrarCajaDto, MovimientoCajaDto } from './dto/caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private cajaService: CajaService) {}

  @Get()
  findAll() {
    return this.cajaService.findAll();
  }

  @Get('actual')
  findActual() {
    return this.cajaService.findActual();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cajaService.findOne(id);
  }

  @Post('abrir')
  abrir(@Body() dto: AbrirCajaDto) {
    return this.cajaService.abrir(dto);
  }

  @Post(':id/cerrar')
  cerrar(@Param('id') id: string, @Body() dto: CerrarCajaDto) {
    return this.cajaService.cerrar(id, dto);
  }

  @Post(':id/movimiento')
  addMovimiento(@Param('id') id: string, @Body() dto: MovimientoCajaDto) {
    return this.cajaService.addMovimiento(id, dto);
  }
}
