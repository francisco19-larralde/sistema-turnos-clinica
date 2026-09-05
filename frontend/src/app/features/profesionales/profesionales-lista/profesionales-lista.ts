import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';


@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  selector: 'app-profesionales-lista',
  styleUrl: './profesionales-lista.css',
  templateUrl: './profesionales-lista.html',
})
export class ProfesionalesLista implements OnInit {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly profesionales = signal<Profesional[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.cargarProfesionales();
  }

  cargarProfesionales() {
    this.cargando.set(true);
    this.error.set(null);

    this.profesionalService.listar().subscribe({
      next: (datos) => {
        console.log('DATOS:', datos);
        this.profesionales.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los profesionales');
        this.cargando.set(false);
      },
    });
  }

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
        this.profesionales.update((lista) => lista.filter((p) => p.id !== id));
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
