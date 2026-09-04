export type Rol = 'ADMINISTRATIVO' | 'PROFESIONAL' | 'PACIENTE';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
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
