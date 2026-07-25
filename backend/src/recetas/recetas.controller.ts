import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private recetasService: RecetasService) {}

  @Get()
  findAll() {
    return this.recetasService.findAll();
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.recetasService.findByProducto(productoId);
  }

  @Post()
  @Roles('ADMIN')
  upsert(@Body() dto: CreateRecetaDto) {
    return this.recetasService.upsert(dto);
  }

  @Delete('producto/:productoId')
  @Roles('ADMIN')
  remove(@Param('productoId') productoId: string) {
    return this.recetasService.remove(productoId);
  }
}
