import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ActualizarEspecialidad, CrearEspecialidad, Especialidad } from "../models/especialidad.model";
import { Observable } from "rxjs";




@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly urlBase = `${environment.apiUrl}/especialidades`;
  private readonly http = inject(HttpClient);


  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.urlBase);
  }

  buscarPorId(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.urlBase}/${id}`);
  }

  crear(datos: CrearEspecialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.urlBase, datos);
  }

  actualizar(id: number, datos: ActualizarEspecialidad): Observable<Especialidad> {
    return this.http.patch<Especialidad>(`${this.urlBase}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }

}
