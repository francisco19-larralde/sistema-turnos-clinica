import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DatosPersonalesDto } from '../../auth/dto/actualizar-perfil.dto';

export class ActualizarPacienteDto extends DatosPersonalesDto {
    @IsOptional() @IsString() @MinLength(8) @MaxLength(128)
    contrasena?: string;
    @IsOptional()
    @IsString()
    @MaxLength(20)
    dni?: string;

    @IsOptional()
    @IsDateString()
    fechaNacimiento?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    telefono?: string;
}
