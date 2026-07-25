import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RepartosService } from './repartos.service';
import { AssignPedidosDto, CreateRepartoDto, UpdateEstadoRepartoDto } from './dto/create-reparto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('repartos')
export class RepartosController {
  constructor(private repartosService: RepartosService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.repartosService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repartosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRepartoDto) {
    return this.repartosService.create(dto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoRepartoDto) {
    return this.repartosService.updateEstado(id, dto);
  }

  @Patch(':id/assign')
  assignPedidos(@Param('id') id: string, @Body() dto: AssignPedidosDto) {
    return this.repartosService.assignPedidos(id, dto);
  }

  @Patch(':id/remove-pedido/:pedidoId')
  removePedido(@Param('id') id: string, @Param('pedidoId') pedidoId: string) {
    return this.repartosService.removePedido(pedidoId);
  }
}
