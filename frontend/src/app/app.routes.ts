import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { authGuard } from './core/guards/auth.guard';
import { Registro } from './features/registro/registro';
import { guestGuard } from './core/guards/guest.guard';
import { EspecialidadesLista } from './features/especialidades/especialidades-lista/especialidades-lista';
import { EspecialidadFormulario } from './features/especialidades/especialidad-formulario/especialidad-formulario';
import { ProfesionalesLista } from './features/profesionales/profesionales-lista/profesionales-lista';
import { ProfesionalFormulario } from './features/profesionales/profesional-formulario/profesional-formulario';
import { PacientesLista } from './features/pacientes/pacientes-lista/pacientes-lista';
import { PacienteFormulario } from './features/pacientes/paciente-formulario/paciente-formulario';
import { TurnosLista } from './features/turnos/turnos-lista/turnos-lista';
import { TurnoFormularioComponent } from './features/turnos/turnos-formulario/turnos-formulario';
import { DisponibilidadProfesional } from './features/disponibilidad-profesional/disponibilidad-profesional';
import { administrativoGuard } from './core/guards/administrativo.guard';
import { AgendaDiaria } from './features/turnos/agenda-diaria/agenda-diaria';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/home/home').then(m => m.Home),
  },
  {
    path: 'agenda',
    canActivate: [authGuard, administrativoGuard],
    component: AgendaDiaria,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'registro',
    component: Registro,
    canActivate: [guestGuard],
  },
  {
    path: 'especialidades',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EspecialidadesLista,
      },
      {
        path: 'nueva',
        component: EspecialidadFormulario,
      },
      {
        path: ':id/editar',
        component: EspecialidadFormulario,
      },
    ],
  },
  {
    path: 'profesionales',
    canActivate: [authGuard, administrativoGuard],
    children: [
      {
        path: '',
        component: ProfesionalesLista,
      },
      {
        path: 'nuevo',
        component: ProfesionalFormulario,
      },
      {
        path: ':id/editar',
        component: ProfesionalFormulario,
      },
      {
        path: ':id/disponibilidad',
        component: DisponibilidadProfesional,
      },
    ],
  },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: PacientesLista,
      },
      {
        path: ':id/editar',
        component: PacienteFormulario,
      },
    ],
  },
  {
    path: 'turnos',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: TurnosLista,
      },
      {
        path: 'nuevo',
        component: TurnoFormularioComponent,
      },
      {
        path: ':id/gestionar',
        loadComponent: () => import('./features/turnos/reprogramar-turno/reprogramar-turno').then(m => m.ReprogramarTurno),
      },
    ],
  },
  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  }
];
