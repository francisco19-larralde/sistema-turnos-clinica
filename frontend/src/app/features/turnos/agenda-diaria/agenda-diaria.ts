import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { Turno, EstadoTurno } from '../../../core/models/turno.model';
import { TurnoService } from '../../../core/services/turno.service';

@Component({
  selector: 'app-agenda-diaria',
  imports: [FormsModule, RouterLink, ButtonModule, DatePickerModule, InputTextModule, SelectModule, TagModule],
  templateUrl: './agenda-diaria.html',
})
export class AgendaDiaria implements OnInit {
  private readonly servicio = inject(TurnoService);
  readonly fecha = signal<Date>(new Date());
  readonly profesionalId = signal<number | null>(null);
  readonly estado = signal<EstadoTurno | null>(null);
  readonly busqueda = signal('');
  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly estados = ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'];
  readonly profesionales = computed(() => Array.from(new Map(
    this.turnos().map(t => [t.profesional.id, {
      id: t.profesional.id,
      nombre: t.profesional.usuario.nombre + ' ' + t.profesional.usuario.apellido,
    }]),
  ).values()).sort((a, b) => a.nombre.localeCompare(b.nombre)));

  readonly turnosDelDia = computed(() => {
    const fecha = this.fecha();
    const clave = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0')].join('-');
    return this.turnos().filter(t => t.fecha.slice(0, 10) === clave);
  });

  readonly filtrados = computed(() => this.turnosDelDia().filter(t =>
    (this.profesionalId() === null || t.profesional.id === this.profesionalId()) &&
    (this.estado() === null || t.estado === this.estado()) &&
    this.normalizar(t.paciente.usuario.nombre + ' ' + t.paciente.usuario.apellido)
      .includes(this.normalizar(this.busqueda().trim())),
  ).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: datos => { this.turnos.set(datos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la agenda. Volvé a intentar.'); this.cargando.set(false); },
    });
  }

  seleccionarFecha(fecha: Date | null): void {
    if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) this.fecha.set(fecha);
  }

  moverDia(cantidad: number): void {
    const fecha = new Date(this.fecha());
    fecha.setDate(fecha.getDate() + cantidad);
    this.fecha.set(fecha);
  }

  hoy(): void { this.fecha.set(new Date()); }

  limpiarFiltros(): void {
    this.profesionalId.set(null);
    this.estado.set(null);
    this.busqueda.set('');
  }

  severidad(estado: EstadoTurno): 'success' | 'info' | 'danger' | 'warn' {
    return estado === 'CONFIRMADO' ? 'success' : estado === 'COMPLETADO' ? 'info'
      : estado === 'CANCELADO' ? 'danger' : 'warn';
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
