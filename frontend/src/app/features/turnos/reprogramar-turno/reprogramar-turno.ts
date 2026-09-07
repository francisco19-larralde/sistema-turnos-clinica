import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Turno } from '../../../core/models/turno.model';
import { TurnoService } from '../../../core/services/turno.service';
import { MatrizTurnos } from '../turnos-matriz/turnos';
import { HistorialTurno } from '../historial-turno/historial-turno';

@Component({
  selector: 'app-reprogramar-turno',
  imports: [DatePipe, RouterLink, FormsModule, ButtonModule, InputTextModule, TagModule, MatrizTurnos, HistorialTurno],
  templateUrl: './reprogramar-turno.html',
})
export class ReprogramarTurno implements OnInit {
  private readonly servicio = inject(TurnoService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly turno = signal<Turno | null>(null);
  readonly seleccion = signal<{ fecha: string; hora: string } | null>(null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly revision = signal(0);
  motivo = '';
  private id = 0;
  readonly puedeReprogramar = computed(() => {
    const turno = this.turno();
    return !!turno && ['PENDIENTE', 'CONFIRMADO'].includes(turno.estado) &&
      new Date(turno.fecha.slice(0, 10) + 'T' + turno.horaInicio + ':00').getTime() > Date.now();
  });

  ngOnInit(): void {
    this.id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.errorCarga.set('El identificador del turno no es válido.');
      return;
    }
    this.cargar();
  }

  cargar(): void {
    if (this.cargando() || this.guardando()) return;
    this.cargando.set(true);
    this.seleccion.set(null);
    this.errorCarga.set(null);
    this.servicio.buscarPorId(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: turno => { this.turno.set(turno); this.cargando.set(false); },
      error: () => { this.errorCarga.set('No se pudo cargar el turno o no tenés permiso para verlo.'); this.cargando.set(false); },
    });
  }

  guardar(): void {
    if (this.guardando() || !this.puedeReprogramar()) return;
    const turno = this.turno();
    const seleccion = this.seleccion();
    this.error.set(null);
    this.exito.set(null);
    if (!turno || !seleccion || this.motivo.trim().length < 3 || this.motivo.trim().length > 200) {
      this.error.set('Elegí un nuevo horario e ingresá un motivo de 3 a 200 caracteres.');
      return;
    }
    this.guardando.set(true);
    this.servicio.reprogramar(turno.id, {
      fecha: seleccion.fecha, horaInicio: seleccion.hora, motivo: this.motivo.trim(), version: turno.version,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizado => {
        this.turno.set(actualizado);
        this.seleccion.set(null);
        this.motivo = '';
        this.revision.update(valor => valor + 1);
        this.guardando.set(false);
        this.exito.set('Turno reprogramado. El nuevo horario quedó pendiente de confirmación.');
      },
      error: err => {
        this.guardando.set(false);
        this.seleccion.set(null);
        const mensaje = err.error?.mensaje;
        this.error.set(Array.isArray(mensaje) ? mensaje.join('. ') : mensaje ?? 'No se pudo reprogramar el turno.');
      },
    });
  }
}
