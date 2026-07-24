import { Module } from '@nestjs/common';
import { RepartosController } from './repartos.controller';
import { RepartosService } from './repartos.service';

@Module({
  controllers: [RepartosController],
  providers: [RepartosService],
  exports: [RepartosService],
})
export class RepartosModule {}
