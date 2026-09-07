import { Especialidad } from './especialidad.model';

export interface Profesional {
  id: number;
  matricula: string;
  telefono: string | null;
  especialidad: Especialidad;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface CrearProfesional {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  matricula: string;
  telefono?: string;
  especialidadId: number;
}

export interface ActualizarProfesional {
  nombre?: string;
  apellido?: string;
  email?: string;
  contrasena?: string;
  matricula?: string;
  telefono?: string;
  especialidadId?: number;
}
