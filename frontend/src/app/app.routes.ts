import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { authGuard } from './core/guards/auth.guard';
import { Registro } from './features/registro/registro';
import { guestGuard } from './core/guards/guest.guard';

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
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  }
];
