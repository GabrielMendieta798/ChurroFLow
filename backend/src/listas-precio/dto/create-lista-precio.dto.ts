import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ListaPrecioItemDto {
  @IsString()
  productoId: string;

  precio: number;
}

export class CreateListaPrecioDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListaPrecioItemDto)
  items: ListaPrecioItemDto[];
}
