import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsDateString, IsOptional } from "class-validator";


export class RegistrarPacienteDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    apellido: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    contrasena: string;

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