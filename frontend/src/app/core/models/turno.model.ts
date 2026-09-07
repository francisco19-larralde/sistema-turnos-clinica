export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO';

export interface Turno {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoTurno;
  paciente: { id: number; usuario: { nombre: string; apellido: string } };
  profesional: {
    id: number;
    usuario: { nombre: string; apellido: string };
    especialidad: { nombre: string };
  };
}

export interface CrearTurno {
  profesionalId: number;
  fecha: string;
  horaInicio: string;
}
