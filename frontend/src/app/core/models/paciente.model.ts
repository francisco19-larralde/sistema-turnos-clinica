export interface Paciente {
  id: number;
  dni: string;
  fechaNacimiento: string;
  telefono: string | null;
  usuario: { id: number; nombre: string; apellido: string; email: string };
}

export interface ActualizarPaciente {
  nombre?: string;
  apellido?: string;
  email?: string;
  contrasena?: string;
  dni?: string;
  fechaNacimiento?: string;
  telefono?: string;
}
