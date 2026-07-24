import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { EstadoPedido } from '@prisma/client';

export class PedidoItemDto {
  @IsString()
  productoId: string;

  @Min(1)
  cantidad: number;

  @Min(0)
  precioUnit: number;
}

export class CreatePedidoDto {
  @IsString()
  clienteId: string;

  @IsOptional()
  @IsString()
  direccionEntregaId?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  fechaEntrega?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}

export class UpdateEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;
}
