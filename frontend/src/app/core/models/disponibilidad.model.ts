export type DiaSemana =
  | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface Disponibilidad {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  profesionalId: number;
}
