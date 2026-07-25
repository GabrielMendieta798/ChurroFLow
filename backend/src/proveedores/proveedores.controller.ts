import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProveedorDto>) {
    return this.proveedoresService.update(id, dto);
  }
}
