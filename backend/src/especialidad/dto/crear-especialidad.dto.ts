import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CrearEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descripcion?: string;
}