import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Paciente } from '../../../core/models/paciente.model';
import { PacienteService } from '../../../core/services/paciente.service';

@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  selector: 'app-pacientes-lista',
  styleUrl: './pacientes-lista.css',
  templateUrl: './pacientes-lista.html',
})
export class PacientesLista implements OnInit {
  readonly pacientes = signal<Paciente[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.cargando.set(true);
    this.pacienteService.listar().subscribe({
      next: (datos) => {
        this.pacientes.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pacientes');
        this.cargando.set(false);
      },
    });
  }

  confirmarEliminacion(paciente: Paciente): void {
    this.confirmationService.confirm({
      message: `¿Seguro que querés eliminar a ${paciente.usuario.nombre} ${paciente.usuario.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pacienteService.eliminar(paciente.id).subscribe({
          next: () => {
            this.pacientes.update((lista) => lista.filter((p) => p.id !== paciente.id));
            this.messageService.add({ severity: 'success', summary: 'Paciente eliminado' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar' }),
        });
      },
    });
  }



}
