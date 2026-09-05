import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Profesional, CrearProfesional, ActualizarProfesional } from "../models/profesional.model";



@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private readonly urlBase = `${environment.apiUrl}/profesionales`;
  private readonly http = inject(HttpClient);


  listar(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.urlBase);
  }

  buscarPorId(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.urlBase}/${id}`);
  }

  crear(datos: CrearProfesional): Observable<Profesional> {
    return this.http.post<Profesional>(this.urlBase, datos);
  }

  actualizar(id: number, datos: ActualizarProfesional): Observable<Profesional> {
    return this.http.patch<Profesional>(`${this.urlBase}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }






}
