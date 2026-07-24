import { IsOptional, IsString } from 'class-validator';

export class CreateZonaRepartoDto {
  @IsString()
  nombre: string;
}
