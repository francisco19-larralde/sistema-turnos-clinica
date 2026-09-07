import { TablaRemota } from '../../../core/services/tabla-remota';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';


import { FiltrosTabla } from '../../components/filtros-tabla/filtros-tabla';

@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule, FiltrosTabla],
  providers: [ConfirmationService, MessageService],
  selector: 'app-profesionales-lista',
  styleUrl: './profesionales-lista.css',
  templateUrl: './profesionales-lista.html',
})
export class ProfesionalesLista implements OnInit {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  readonly authService = inject(AuthService);

  readonly pagina = new TablaRemota<Profesional>('profesionales');
  readonly profesionales = this.pagina.datos;
  readonly cargando = this.pagina.cargando;
  readonly error = this.pagina.error;

  ngOnInit() {  }

  cargarProfesionales() { this.pagina.cargar(); }

  confirmarEliminacion(profesional: Profesional): void {
    this.confirmationService.confirm({
      message: `¿Seguro que querés eliminar a ${profesional.usuario.nombre} ${profesional.usuario.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminar(profesional.id),
    });
  }

  eliminar(id: number): void {
    this.profesionalService.eliminar(id).subscribe({
      next: () => {
        this.pagina.cargar();
        this.messageService.add({ severity: 'success', summary: 'Profesional eliminado' });
      },
      error: (err) => {
        const mensaje = err.status === 403
          ? 'No tenés permisos para eliminar profesionales'
          : 'No se pudo eliminar';
        this.messageService.add({ severity: 'error', summary: mensaje });
      },
    });
  }
}
