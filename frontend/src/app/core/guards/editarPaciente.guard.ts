import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const editarPacienteGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();
  const idPaciente = route.paramMap.get('id');

  if (!usuario || !idPaciente) {
    return router.createUrlTree(['/inicio']);
  }


  if (usuario.rol === 'ADMINISTRATIVO') {
    return true;
  }

  if (
    usuario.rol === 'PACIENTE' &&
    String(usuario.id) === idPaciente
  ) {
    return true;
  }

  return router.createUrlTree(['/inicio']);
};
