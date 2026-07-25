import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insumos')
export class InsumosController {
  constructor(private insumosService: InsumosService) {}

  @Get()
  findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateInsumoDto) {
    return this.insumosService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateInsumoDto>) {
    return this.insumosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }
}
