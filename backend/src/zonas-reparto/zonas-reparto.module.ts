import { Module } from '@nestjs/common';
import { ZonasRepartoController } from './zonas-reparto.controller';
import { ZonasRepartoService } from './zonas-reparto.service';

@Module({
  controllers: [ZonasRepartoController],
  providers: [ZonasRepartoService],
  exports: [ZonasRepartoService],
})
export class ZonasRepartoModule {}
