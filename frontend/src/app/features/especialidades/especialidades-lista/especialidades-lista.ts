import { TablaRemota } from '../../../core/services/tabla-remota';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Especialidad } from '../../../core/models/especialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { FiltrosTabla } from '../../components/filtros-tabla/filtros-tabla';

@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule, FiltrosTabla],
  providers: [ConfirmationService, MessageService],
  selector: 'app-especialidades-lista',
  styleUrl: './especialidades-lista.css',
  templateUrl: './especialidades-lista.html',
})
export class EspecialidadesLista implements OnInit {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);



  readonly pagina = new TablaRemota<Especialidad>('especialidades');
  readonly especialidades = this.pagina.datos;
  readonly cargando = this.pagina.cargando;
  readonly error = this.pagina.error;


  ngOnInit() {  }

  cargarEspecialidades() { this.pagina.cargar(); }


  confirmarEliminacion(especialidad: Especialidad): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la especialidad ${especialidad.nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminar(especialidad.id),
    });
  }

  private eliminar(id: number): void {
    this.especialidadService.eliminar(id).subscribe({
      next: () => {
        this.pagina.cargar();
        this.messageService.add({ severity: 'success', summary: 'Especialidad eliminada' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar' });
      }
    })
  }





}
