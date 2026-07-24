import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DireccionesEntregaService } from './direcciones-entrega.service';
import { CreateDireccionEntregaDto } from './dto/create-direccion-entrega.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('direcciones-entrega')
export class DireccionesEntregaController {
  constructor(private service: DireccionesEntregaService) {}

  @Get()
  findByCliente(@Query('clienteId') clienteId: string) {
    return this.service.findByCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDireccionEntregaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDireccionEntregaDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
