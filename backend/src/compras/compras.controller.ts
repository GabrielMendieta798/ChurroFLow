import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('compras')
export class ComprasController {
  constructor(private comprasService: ComprasService) {}

  @Get()
  findAll() {
    return this.comprasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comprasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCompraDto) {
    return this.comprasService.create(dto);
  }
}
