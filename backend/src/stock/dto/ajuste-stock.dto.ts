import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoMovimientoStock } from '@prisma/client';

export class AjusteStockDto {
  @IsString()
  insumoId: string;

  @IsEnum(TipoMovimientoStock)
  tipo: TipoMovimientoStock;

  @IsNumber()
  cantidad: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
