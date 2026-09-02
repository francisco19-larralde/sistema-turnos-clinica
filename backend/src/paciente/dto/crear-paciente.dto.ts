import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearPacienteDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    apellido: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    dni: string;

    @IsDateString()
    fechaNacimiento: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    telefono?: string;
}