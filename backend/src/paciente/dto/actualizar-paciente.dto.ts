import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPacienteDto {
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