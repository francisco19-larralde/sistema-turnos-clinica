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

export const routes: Routes = [
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
    canActivate: [authGuard],
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
    ],
  },
  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  }
];
