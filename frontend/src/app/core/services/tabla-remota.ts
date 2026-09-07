import { DestroyRef, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Pagina<T> { datos: T[]; total: number; pagina: number; limite: number; }

export class TablaRemota<T> {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;
  private evento: TableLazyLoadEvent = { first: 0, rows: 10 };
  readonly datos = signal<T[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly primero = signal(0);
  readonly filas = signal(10);

  constructor(private readonly recurso: string) {
    this.destroyRef.onDestroy(() => this.peticion?.unsubscribe());
  }

  cargar(evento: TableLazyLoadEvent = this.evento): void {
    this.evento = evento;
    this.peticion?.unsubscribe();
    const limite = evento.rows ?? 10;
    const primero = evento.first ?? 0;
    this.primero.set(primero);
    this.filas.set(limite);
    let params = new HttpParams().set('pagina', Math.floor(primero / limite) + 1).set('limite', limite);
    const valor = (campo: string) => {
      const filtro = evento.filters?.[campo];
      return (Array.isArray(filtro) ? filtro[0] : filtro)?.value;
    };
    const busqueda = evento.globalFilter ?? valor('global');
    if (busqueda) params = params.set('busqueda', String(busqueda));
    if (valor('fecha')) params = params.set('fecha', valor('fecha'));
    if (valor('estado')) params = params.set('estado', valor('estado'));
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.http.get<Pagina<T>>(`${environment.apiUrl}/${this.recurso}/pagina`, { params }).subscribe({
      next: pagina => {
        if (primero > 0 && primero >= pagina.total) {
          this.cargar({ ...evento, first: Math.max(0, Math.ceil(pagina.total / limite) - 1) * limite });
          return;
        }
        this.datos.set(pagina.datos);
        this.total.set(pagina.total);
        this.cargando.set(false);
      },
      error: () => {
        this.datos.set([]);
        this.total.set(0);
        this.error.set('No se pudo cargar la página. Volvé a intentar.');
        this.cargando.set(false);
      },
    });
  }
}
