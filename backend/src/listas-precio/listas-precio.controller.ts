import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ListasPrecioService } from './listas-precio.service';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('ADMIN')
  create(@Body() dto: CreateListaPrecioDto) {
    return this.listasPrecioService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateListaPrecioDto>) {
    return this.listasPrecioService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.listasPrecioService.remove(id);
  }
}
