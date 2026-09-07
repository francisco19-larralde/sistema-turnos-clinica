import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './navbar.html',
  host: { class: 'sticky top-0 z-50 block' },
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly menuAbierto = signal(false);
  readonly enlaces = computed(() => {
    const base = [{ texto: 'Inicio', ruta: '/inicio' }, { texto: 'Turnos', ruta: '/turnos' }, { texto: 'Mi perfil', ruta: '/perfil' }];
    return this.authService.usuarioActual()?.rol === 'ADMINISTRATIVO'
      ? [...base, { texto: 'Agenda', ruta: '/agenda' }, { texto: 'Profesionales', ruta: '/profesionales' }, { texto: 'Pacientes', ruta: '/pacientes' }, { texto: 'Especialidades', ruta: '/especialidades' }]
      : base;
  });
  readonly publicos = [
    { texto: 'Cómo funciona', fragmento: 'como-funciona' },
    { texto: 'Nuestra propuesta', fragmento: 'cuidarte' },
    { texto: 'Preguntas frecuentes', fragmento: 'preguntas' },
  ];
  constructor() {
    inject(Router).events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(evento => {
      if (evento instanceof NavigationEnd) this.menuAbierto.set(false);
    });
  }
}
