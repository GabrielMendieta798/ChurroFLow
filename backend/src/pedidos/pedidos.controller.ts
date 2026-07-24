import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto, UpdateEstadoPedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.pedidosService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoPedidoDto) {
    return this.pedidosService.updateEstado(id, dto);
  }

  @Patch(':id/remove-reparto')
  removeFromReparto(@Param('id') id: string) {
    return this.pedidosService.removeFromReparto(id);
  }
}
