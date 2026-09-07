import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core"
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Disponibilidad } from "../models/disponibilidad.model";




@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);

  listarPorProfesional(profesionalId: number): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(
      `${environment.apiUrl}/disponibilidad/profesional/${profesionalId}/disponibilidades`,
    );
  }

}
