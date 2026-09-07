import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarPaciente, Paciente } from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly urlBase = `${environment.apiUrl}/pacientes`;

  constructor(private readonly http: HttpClient) { }

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.urlBase);
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.urlBase}/${id}`);
  }

  actualizar(id: number, datos: ActualizarPaciente): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.urlBase}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
