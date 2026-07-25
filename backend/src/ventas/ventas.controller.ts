import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private ventasService: VentasService) {}

  @Get()
  findAll(@Query('fechaDesde') fechaDesde?: string, @Query('fechaHasta') fechaHasta?: string) {
    return this.ventasService.findAll(fechaDesde, fechaHasta);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVentaDto, @Request() req) {
    return this.ventasService.create(dto, req.user.id);
  }
}
