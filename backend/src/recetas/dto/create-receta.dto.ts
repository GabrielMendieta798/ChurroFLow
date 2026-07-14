import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

export class RecetaItemDto {
  @IsString()
  insumoId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;
}

export class CreateRecetaDto {
  @IsString()
  productoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaItemDto)
  items: RecetaItemDto[];
}
