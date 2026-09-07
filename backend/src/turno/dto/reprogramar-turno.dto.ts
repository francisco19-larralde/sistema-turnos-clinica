import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class ReprogramarTurnoDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio: string;

  @IsInt() @Min(0)
  version: number;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(3) @MaxLength(200)
  motivo: string;
}
