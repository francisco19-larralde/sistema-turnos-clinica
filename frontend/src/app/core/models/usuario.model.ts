export type Rol = 'ADMINISTRATIVO' | 'PROFESIONAL' | 'PACIENTE';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

export interface PerfilUsuario extends UsuarioAutenticado {
  paciente: { id: number; dni: string; fechaNacimiento: string; telefono: string | null } | null;
  profesional: { id: number; matricula: string; telefono: string | null; especialidadId: number;
    especialidad: { id: number; nombre: string } } | null;
}

export interface ActualizarPerfil {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  fechaNacimiento?: string;
  telefono?: string;
  matricula?: string;
  especialidadId?: number;
  contrasenaActual?: string;
  nuevaContrasena?: string;
}

export interface RespuestaLogin {
  accessToken: string;
  usuario: UsuarioAutenticado;
}

export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

export interface CredencialesRegistro {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  dni: string;
  fechaNacimiento: string;
  telefono?: string;
}
