import { TablaRemota } from '../../../core/services/tabla-remota';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Paciente } from '../../../core/models/paciente.model';
import { PacienteService } from '../../../core/services/paciente.service';

import { FiltrosTabla } from '../../components/filtros-tabla/filtros-tabla';

@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule, FiltrosTabla],
  providers: [ConfirmationService, MessageService],
  selector: 'app-pacientes-lista',
  styleUrl: './pacientes-lista.css',
  templateUrl: './pacientes-lista.html',
})
export class PacientesLista implements OnInit {
  readonly pagina = new TablaRemota<Paciente>('pacientes');
  readonly pacientes = this.pagina.datos;
  readonly cargando = this.pagina.cargando;
  readonly error = this.pagina.error;

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) { }

  ngOnInit(): void {  }

  confirmarEliminacion(paciente: Paciente): void {
    this.confirmationService.confirm({
      message: `¿Seguro que querés eliminar a ${paciente.usuario.nombre} ${paciente.usuario.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pacienteService.eliminar(paciente.id).subscribe({
          next: () => {
            this.pagina.cargar();
            this.messageService.add({ severity: 'success', summary: 'Paciente eliminado' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar' }),
        });
      },
    });
  }



}
