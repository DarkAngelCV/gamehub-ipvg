import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearResultadoDto {
  @IsInt()
  @Min(1)
  partidoId: number;

  @IsInt()
  @Min(0)
  puntosLocal: number;

  @IsInt()
  @Min(0)
  puntosVisitante: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  observaciones?: string;
}