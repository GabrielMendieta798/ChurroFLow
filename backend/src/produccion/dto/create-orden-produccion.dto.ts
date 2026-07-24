import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EstadoProduccion } from '@prisma/client';

export class CreateOrdenProduccionDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateEstadoDto {
  @IsEnum(EstadoProduccion)
  estado: EstadoProduccion;
}
