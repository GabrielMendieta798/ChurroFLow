import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UnidadMedida } from '@prisma/client';

export class CreateInsumoDto {
  @IsString()
  nombre: string;

  @IsEnum(UnidadMedida)
  unidad: UnidadMedida;

  @IsNumber()
  @Min(0)
  stockActual: number;

  @IsNumber()
  @Min(0)
  stockMinimo: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoUnitario?: number;
}
