import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ZonasRepartoService } from './zonas-reparto.service';
import { CreateZonaRepartoDto } from './dto/create-zona-reparto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('zonas-reparto')
export class ZonasRepartoController {
  constructor(private service: ZonasRepartoService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() dto: CreateZonaRepartoDto) { return this.service.create(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateZonaRepartoDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
