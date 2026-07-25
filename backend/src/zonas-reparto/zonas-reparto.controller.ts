import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ZonasRepartoService } from './zonas-reparto.service';
import { CreateZonaRepartoDto } from './dto/create-zona-reparto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('zonas-reparto')
export class ZonasRepartoController {
  constructor(private service: ZonasRepartoService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateZonaRepartoDto) { return this.service.create(dto); }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateZonaRepartoDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
