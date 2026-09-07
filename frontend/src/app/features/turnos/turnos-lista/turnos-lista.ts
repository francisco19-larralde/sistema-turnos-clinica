import { Component, inject, OnInit, signal } from '@angular/core';
import { Turno } from '../../../core/models/turno.model';
import { AuthService } from '../../../core/services/auth.service';
import { TurnoService } from '../../../core/services/turno.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  imports: [RouterLink, DatePipe, TableModule, ButtonModule, TagModule, ToastModule, ConfirmDialog],
  providers: [ConfirmationService, MessageService],
  selector: 'app-turnos-lista',
  styleUrl: './turnos-lista.css',
  templateUrl: './turnos-lista.html',
})
export class TurnosLista implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);



  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.turnoService.listar().subscribe({
      next: (datos) => {
        this.turnos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los turnos');
        this.cargando.set(false);
      },
    });
  }

  puedeCancelar(turno: Turno): boolean {
    return turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO';
  }

  esProfesionalOAdmin(): boolean {
    const rol = this.authService.usuarioActual()?.rol;
    return rol === 'PROFESIONAL' || rol === 'ADMINISTRATIVO';
  }

  confirmarCancelacion(turno: Turno): void {
    this.confirmationService.confirm({
      message: `¿Seguro que querés cancelar el turno del ${turno.fecha} a las ${turno.horaInicio}
      con el profesional ${turno.profesional.usuario.nombre} del area ${turno.profesional.especialidad.nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.turnoService.cancelar(turno.id).subscribe({
          next: (actualizado) => this.reemplazar(actualizado),
          error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo cancelar el turno' }),
        });
      },
    })
  }

  confirmar(turno: Turno): void {
    this.turnoService.confirmar(turno.id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo confirmar el turno' }),
    });
  }

  completar(turno: Turno): void {
    this.turnoService.completar(turno.id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo completar el turno' }),
    });
  }

  severidadEstado(estado: string): 'success' | 'info' | 'danger' | 'warn' {
    switch (estado) {
      case 'CONFIRMADO': return 'success';
      case 'COMPLETADO': return 'info';
      case 'CANCELADO': return 'danger';
      default: return 'warn';
    }
  }



  private reemplazar(actualizado: Turno): void {
    this.turnos.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
  }
}
