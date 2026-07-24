import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoReparto } from '@prisma/client';

export class CreateRepartoDto {
  @IsOptional()
  @IsString()
  zonaRepartoId?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pedidoIds?: string[];
}

export class UpdateEstadoRepartoDto {
  @IsEnum(EstadoReparto)
  estado: EstadoReparto;
}

export class AssignPedidosDto {
  @IsArray()
  @IsString({ each: true })
  pedidoIds: string[];
}
