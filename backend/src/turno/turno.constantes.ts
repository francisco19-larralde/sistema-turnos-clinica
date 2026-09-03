import { DiaSemana } from '../generated/prisma/client';

export const DURACION_TURNO_MINUTOS = 30;

export function horaAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

export function minutosAHora(totalMinutos: number): string {
    const horas = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
    const minutos = (totalMinutos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}

const DIAS_SEMANA: DiaSemana[] = [
    DiaSemana.DOMINGO,
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
    DiaSemana.SABADO,
];

export function obtenerDiaSemana(fecha: Date): DiaSemana {
    return DIAS_SEMANA[fecha.getUTCDay()];
}