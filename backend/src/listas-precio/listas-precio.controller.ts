import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ListasPrecioService } from './listas-precio.service';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('listas-precio')
export class ListasPrecioController {
  constructor(private listasPrecioService: ListasPrecioService) {}

  @Get()
  findAll() {
    return this.listasPrecioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listasPrecioService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateListaPrecioDto) {
    return this.listasPrecioService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateListaPrecioDto>) {
    return this.listasPrecioService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listasPrecioService.remove(id);
  }
}
