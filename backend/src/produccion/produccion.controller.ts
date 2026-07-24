import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateOrdenProduccionDto, UpdateEstadoDto } from './dto/create-orden-produccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('produccion')
export class ProduccionController {
  constructor(private produccionService: ProduccionService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.produccionService.findAll(estado);
  }

  @Get('bajo-stock')
  getProductosBajoStock() {
    return this.produccionService.getProductosBajoStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrdenProduccionDto) {
    return this.produccionService.create(dto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.produccionService.updateEstado(id, dto);
  }
}
