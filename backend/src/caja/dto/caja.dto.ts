import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoMovimientoCaja } from '@prisma/client';

export class AbrirCajaDto {
  @IsNumber()
  @Min(0)
  montoInicial: number;
}

export class CerrarCajaDto {
  @IsNumber()
  @Min(0)
  montoFinalReal: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class MovimientoCajaDto {
  @IsEnum(TipoMovimientoCaja)
  tipo: TipoMovimientoCaja;

  @IsString()
  concepto: string;

  @IsNumber()
  @Min(0)
  monto: number;
}
