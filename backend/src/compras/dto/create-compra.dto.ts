import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CompraItemDto {
  @IsString()
  insumoId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsNumber()
  @Min(0)
  costoUnit: number;
}

export class CreateCompraDto {
  @IsString()
  proveedorId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompraItemDto)
  items: CompraItemDto[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
