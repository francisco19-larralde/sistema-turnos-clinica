import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { EstadoTurno } from '../generated/prisma/enums';

export class PaginacionDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pagina: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limite: number = 10;

  @IsOptional() @IsString() @MaxLength(150)
  busqueda?: string;

  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString({ strict: true })
  fecha?: string;

  @IsOptional() @IsEnum(EstadoTurno)
  estado?: EstadoTurno;
}

export function parametrosPagina(consulta: PaginacionDto) {
  const pagina = Number(consulta.pagina ?? 1);
  const limite = Number(consulta.limite ?? 10);
  return { pagina, limite, skip: (pagina - 1) * limite, busqueda: consulta.busqueda?.trim() ?? '' };
}
