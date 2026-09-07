export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO';

export interface Turno {
  id: number;
  version: number;
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

export interface ReprogramacionTurno {
  id: number;
  fechaAnterior: string;
  horaAnterior: string;
  horaFinAnterior: string;
  estadoAnterior: EstadoTurno;
  fechaNueva: string;
  horaNueva: string;
  horaFinNueva: string;
  motivo: string;
  creadoEn: string;
  usuario: { nombre: string; apellido: string; rol: string };
}
