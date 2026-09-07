import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class DatosPersonalesDto {
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(100)
  nombre?: string;

  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(100)
  apellido?: string;

  @IsOptional() @IsEmail()
  email?: string;
}

export class ActualizarPerfilDto extends DatosPersonalesDto {
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(20)
  dni?: string;

  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString({ strict: true })
  fechaNacimiento?: string;

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string;

  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(50)
  matricula?: string;

  @IsOptional() @IsInt() @Min(1)
  especialidadId?: number;

  @IsOptional() @IsString()
  contrasenaActual?: string;

  @IsOptional() @IsString() @MinLength(8) @MaxLength(128)
  nuevaContrasena?: string;
}
