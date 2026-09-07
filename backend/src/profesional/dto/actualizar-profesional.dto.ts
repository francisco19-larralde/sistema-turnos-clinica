import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DatosPersonalesDto } from '../../auth/dto/actualizar-perfil.dto';

export class ActualizarProfesionalDto extends DatosPersonalesDto {
    @IsOptional() @IsString() @MinLength(8) @MaxLength(128)
    contrasena?: string;
    @IsOptional()
    @IsString()
    @MaxLength(50)
    matricula?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    telefono?: string;

    @IsOptional()
    @IsInt()
    especialidadId?: number;
}
