import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
}

const ACCESOS_POR_ROL: Record<string, AccesoRapido[]> = {
  ADMINISTRATIVO: [
    { titulo: 'Turnos', descripcion: 'Ver y gestionar la agenda completa', icono: 'pi pi-calendar', ruta: '/turnos' },
    { titulo: 'Profesionales', descripcion: 'Altas, bajas y especialidades', icono: 'pi pi-user-plus', ruta: '/profesionales' },
    { titulo: 'Pacientes', descripcion: 'Datos y contacto de pacientes', icono: 'pi pi-users', ruta: '/pacientes' },
    { titulo: 'Especialidades', descripcion: 'Administrar el catálogo', icono: 'pi pi-tags', ruta: '/especialidades' },
    { titulo: 'Agenda diaria', descripcion: 'Ver y gestionar la agenda de hoy', icono: 'pi pi-calendar-times', ruta: '/agenda' },
  ],
  PROFESIONAL: [
    { titulo: 'Mi agenda', descripcion: 'Confirmar y completar turnos', icono: 'pi pi-calendar', ruta: '/turnos' },
  ],
  PACIENTE: [
    { titulo: 'Mis turnos', descripcion: 'Ver el estado de tus reservas', icono: 'pi pi-calendar', ruta: '/turnos' },
    { titulo: 'Reservar turno', descripcion: 'Elegí profesional y horario', icono: 'pi pi-calendar-plus', ruta: '/turnos/nuevo' },
  ],
};

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ButtonModule],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  readonly accesos = computed<AccesoRapido[]>(() => {
    const usuario = this.authService.usuarioActual();
    const rol = usuario?.rol ?? '';

    const accesos = ACCESOS_POR_ROL[rol] ?? [];

    return [
      ...accesos.filter(acceso => acceso.titulo !== 'Mi perfil'),
      { titulo: 'Mi perfil', descripcion: 'Actualizar mis datos y contraseña', icono: 'pi pi-user-edit', ruta: '/perfil' },
    ];
  });

  constructor(readonly authService: AuthService) { }

  cerrarSesion(): void {
    this.authService.logout();
  }
}

