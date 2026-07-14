import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Categoria } from '@prisma/client';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsEnum(Categoria)
  categoria: Categoria;
}
