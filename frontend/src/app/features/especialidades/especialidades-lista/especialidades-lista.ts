import { Component, inject, OnInit, signal } from '@angular/core';
import { Especialidad } from '../../../core/models/especialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  imports: [RouterLink, TableModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  selector: 'app-especialidades-lista',
  styleUrl: './especialidades-lista.css',
  templateUrl: './especialidades-lista.html',
})
export class EspecialidadesLista implements OnInit {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);



  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);


  ngOnInit() {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.cargando.set(true);
    this.error.set(null);

    this.especialidadService.listar().subscribe({
      next: (datos) => {
        console.log('DATOS:', datos);
        this.especialidades.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las especialidades');
        this.cargando.set(false);
      }
    })
  }


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
        this.especialidades.update((lista) => lista.filter((e) => e.id !== id));
        this.messageService.add({ severity: 'success', summary: 'Especialidad eliminada' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar' });
      }
    })
  }





}
