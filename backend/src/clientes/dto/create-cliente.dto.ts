import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoCliente } from '@prisma/client';

export class CreateClienteDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  cuit?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsEnum(TipoCliente)
  tipo?: TipoCliente;

  @IsOptional()
  @IsString()
  notas?: string;
}
