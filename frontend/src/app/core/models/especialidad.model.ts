export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
  creadoEn: string;
}

export interface CrearEspecialidad {
  nombre: string;
  descripcion?: string;
}

export type ActualizarEspecialidad = Partial<CrearEspecialidad>;
