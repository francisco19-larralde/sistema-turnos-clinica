import { IsEnum, Matches } from "class-validator";
import { DiaSemana } from "../../generated/prisma/enums";

const FORMATO_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CrearDisponibilidadDto {

    @IsEnum(DiaSemana)
    diaSemana: DiaSemana;

    @Matches(FORMATO_HORA, { message: 'horaInicio debe tener formato HH:mm' })
    horaInicio: string;

    @Matches(FORMATO_HORA, { message: 'horaFin debe tener formato HH:mm' })
    horaFin: string;
}