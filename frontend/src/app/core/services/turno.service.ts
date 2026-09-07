import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { CrearTurno, Turno } from "../models/turno.model";


@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/turnos`;

  listar(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.urlBase);
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
