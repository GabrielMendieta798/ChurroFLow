import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PricingService } from '../shared/pricing.service';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(
    private productosService: ProductosService,
    private pricingService: PricingService,
  ) {}

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('pricing')
  resolvePrice(@Query('productoId') productoId: string, @Query('clienteId') clienteId?: string) {
    return this.pricingService.resolvePrice(productoId, clienteId);
  }

  @Get('pricing/batch')
  resolvePrices(@Query('productoIds') productoIds: string, @Query('clienteId') clienteId?: string) {
    const ids = productoIds.split(',');
    return this.pricingService.resolvePrices(ids, clienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductoDto>) {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }

  @Patch(':id/toggle')
  toggleActivo(@Param('id') id: string) {
    return this.productosService.toggleActivo(id);
  }
}
