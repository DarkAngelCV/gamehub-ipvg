import {
  IsInt,
  Min,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CrearPartidoDto {
  @IsInt()
  @Min(1)
  torneoId: number;

  @IsInt()
  @Min(1)
  equipoLocalId: number;

  @IsInt()
  @Min(1)
  equipoVisitanteId: number;

  @IsDateString()
  fechaPartido: string;
}