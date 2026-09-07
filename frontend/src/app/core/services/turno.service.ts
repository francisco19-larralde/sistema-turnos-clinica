import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { CrearTurno, Turno, ReprogramacionTurno } from "../models/turno.model";
import { Pagina } from './tabla-remota';


@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/turnos`;

  listar(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.urlBase);
  }

  buscarPorId(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.urlBase}/${id}`);
  }

  reprogramar(id: number, datos: { fecha: string; horaInicio: string; motivo: string; version: number }): Observable<Turno> {
    return this.http.patch<Turno>(`${this.urlBase}/${id}/reprogramar`, datos);
  }

  historial(id: number, pagina: number, limite: number): Observable<Pagina<ReprogramacionTurno>> {
    return this.http.get<Pagina<ReprogramacionTurno>>(`${this.urlBase}/${id}/historial`, { params: { pagina, limite } });
  }

  crear(datos: CrearTurno): Observable<Turno> {
    return this.http.post<Turno>(this.urlBase, datos);
  }

  cancelar(id: number): Observable<Turno> {
    return this.http.patch<Turno>(`${this.urlBase}/${id}/cancelar`, {});
  }

  confirmar(id: number): Observable<Turno> {
    return this.http.patch<Turno>(`${this.urlBase}/${id}/confirmar`, {});
  }

  completar(id: number): Observable<Turno> {
    return this.http.patch<Turno>(`${this.urlBase}/${id}/completar`, {});
  }

  obtenerHorariosDisponibles(profesionalId: number, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${environment.apiUrl}/profesionales/${profesionalId}/horarios-disponibles`,
      { params: { fecha } },
    );
  }


}
