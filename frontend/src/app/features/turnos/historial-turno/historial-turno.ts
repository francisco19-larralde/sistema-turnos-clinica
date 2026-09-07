import { Component, DestroyRef, inject, Input, OnChanges, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { ReprogramacionTurno } from '../../../core/models/turno.model';
import { TurnoService } from '../../../core/services/turno.service';

@Component({
  selector: 'app-historial-turno',
  imports: [DatePipe, ButtonModule, PaginatorModule],
  templateUrl: './historial-turno.html',
})
export class HistorialTurno implements OnChanges {
  @Input({ required: true }) turnoId!: number;
  @Input() revision = 0;
  private readonly servicio = inject(TurnoService);
  private peticion?: Subscription;
  readonly registros = signal<ReprogramacionTurno[]>([]);
  readonly total = signal(0);
  readonly primero = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() { inject(DestroyRef).onDestroy(() => this.peticion?.unsubscribe()); }
  ngOnChanges(): void { this.cargar({ first: 0 }); }

  cargar(evento: PaginatorState = { first: this.primero() }): void {
    this.peticion?.unsubscribe();
    const primero = evento.first ?? 0;
    this.primero.set(primero);
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.servicio.historial(this.turnoId, Math.floor(primero / 10) + 1, 10).subscribe({
      next: pagina => {
        this.registros.set(pagina.datos);
        this.total.set(pagina.total);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial.');
        this.cargando.set(false);
      },
    });
  }
}
