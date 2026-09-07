import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import { Bloqueo, BloqueoService } from '../../../core/services/bloqueo.service';

@Component({
  selector: 'app-bloqueos-profesional',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ButtonModule, DatePickerModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './bloqueos-profesional.html',
})
export class BloqueosProfesional implements OnChanges {
  @Input({ required: true }) profesionalId!: number;
  private readonly servicio = inject(BloqueoService);
  private readonly confirmacion = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  readonly bloqueos = signal<Bloqueo[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly hoy = new Date(new Date().setHours(0, 0, 0, 0));
  readonly formulario = this.fb.group({
    fecha: [null as Date | null, Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
  });

  ngOnChanges(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.servicio.listar(this.profesionalId).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: datos => this.bloqueos.set(datos),
      error: () => this.errorCarga.set('No se pudieron cargar los bloqueos.'),
    });
  }

  guardar(): void {
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    this.error.set(null);
    this.exito.set(null);
    const { fecha, motivo } = this.formulario.getRawValue();
    if (this.formulario.invalid || !fecha || fecha < this.hoy || (motivo?.trim().length ?? 0) < 3) {
      this.formulario.markAllAsTouched();
      this.error.set('Elegí una fecha desde hoy y escribí un motivo de 3 a 200 caracteres.');
      return;
    }
    const valorFecha = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0')].join('-');
    this.guardando.set(true);
    this.servicio.crear(this.profesionalId, { fecha: valorFecha, motivo: motivo!.trim() })
      .pipe(finalize(() => this.guardando.set(false))).subscribe({
        next: creado => {
          this.bloqueos.update(lista => [...lista, creado].sort((a, b) => a.fecha.localeCompare(b.fecha)));
          this.formulario.reset();
          this.exito.set('Fecha bloqueada. No se podrán reservar nuevos turnos ese día.');
        },
        error: err => {
          const mensaje = err.error?.mensaje;
          this.error.set(Array.isArray(mensaje) ? mensaje.join('. ') : mensaje ?? 'No se pudo guardar el bloqueo.');
        },
      });
  }

  confirmarEliminar(bloqueo: Bloqueo): void {
    this.confirmacion.confirm({
      header: 'Quitar bloqueo',
      message: 'Se volverán a ofrecer los horarios semanales para esta fecha. ¿Querés continuar?',
      acceptLabel: 'Quitar bloqueo', rejectLabel: 'Volver',
      accept: () => {
        if (this.guardando()) return;
        this.guardando.set(true);
        this.error.set(null);
        this.exito.set(null);
        this.servicio.eliminar(this.profesionalId, bloqueo.id)
          .pipe(finalize(() => this.guardando.set(false))).subscribe({
            next: () => {
              this.bloqueos.update(lista => lista.filter(b => b.id !== bloqueo.id));
              this.exito.set('Bloqueo eliminado.');
            },
            error: () => this.error.set('No se pudo quitar el bloqueo.'),
          });
      },
    });
  }
}
