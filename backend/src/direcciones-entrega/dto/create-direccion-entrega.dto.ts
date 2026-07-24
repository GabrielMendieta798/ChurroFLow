import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDireccionEntregaDto {
  @IsString()
  clienteId: string;

  @IsString()
  alias: string;

  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  barrio?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
