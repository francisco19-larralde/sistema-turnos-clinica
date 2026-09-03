import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CrearProfesionalDto {
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
    @MaxLength(50)
    matricula: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    telefono?: string;

    @IsInt()
    especialidadId: number;
}