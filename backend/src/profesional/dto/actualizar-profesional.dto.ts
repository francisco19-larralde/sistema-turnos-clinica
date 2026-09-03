import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarProfesionalDto {
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