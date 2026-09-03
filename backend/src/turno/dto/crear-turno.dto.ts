import { IsDateString, IsInt, IsOptional, Matches } from 'class-validator';

const FORMATO_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CrearTurnoDto {
    @IsOptional()
    @IsInt()
    pacienteId?: number; // solo lo utiliza un ADMINISTRATIVO; el PACIENTE reserva para sí mismo

    @IsInt()
    profesionalId: number;

    @IsDateString()
    fecha: string;

    @Matches(FORMATO_HORA, { message: 'horaInicio debe tener formato HH:mm' })
    horaInicio: string;
}