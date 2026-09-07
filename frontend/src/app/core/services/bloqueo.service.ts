import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export interface Bloqueo {
  id: number;
  fecha: string;
  motivo: string;
  profesionalId: number;
}

@Injectable({ providedIn: 'root' })
export class BloqueoService {
  private readonly http = inject(HttpClient);
  private url(id: number): string {
    return `${environment.apiUrl}/disponibilidad/profesional/${id}/bloqueos`;
  }
  listar(id: number) { return this.http.get<Bloqueo[]>(this.url(id)); }
  crear(id: number, datos: { fecha: string; motivo: string }) {
    return this.http.post<Bloqueo>(this.url(id), datos);
  }
  eliminar(profesionalId: number, id: number) {
    return this.http.delete(this.url(profesionalId) + '/' + id);
  }
}
