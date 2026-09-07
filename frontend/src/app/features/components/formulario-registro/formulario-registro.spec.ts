import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { FormularioRegistro } from './formulario-registro';

describe('Formulario de registro compartido', () => {
  function preparar() {
    const respuesta = new Subject<unknown>();
    const servicio = { registro: vi.fn(() => respuesta) };
    const router = { navigate: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: servicio }, { provide: Router, useValue: router },
    ] });
    const componente = TestBed.runInInjectionContext(() => new FormularioRegistro());
    return { componente, respuesta, servicio, router };
  }

  it('no envía datos incompletos ni fechas futuras', () => {
    const { componente, servicio } = preparar();
    componente.enviar();
    expect(servicio.registro).not.toHaveBeenCalled();
    expect(componente.invalido('email')).toBe(true);
    componente.formulario.setValue({
      nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', contrasena: 'ejemplo123',
      dni: '12345678', fechaNacimiento: '2099-01-01', telefono: '',
    });
    componente.enviar();
    expect(servicio.registro).not.toHaveBeenCalled();
    expect(componente.error()).toContain('futura');
  });

  it('evita envíos duplicados y lleva al login después de registrar', () => {
    const { componente, respuesta, servicio, router } = preparar();
    componente.formulario.setValue({
      nombre: ' Ana ', apellido: 'Pérez', email: 'ana@example.com', contrasena: 'ejemplo123',
      dni: '12345678', fechaNacimiento: '2000-01-01', telefono: '',
    });
    componente.enviar();
    componente.enviar();
    expect(servicio.registro).toHaveBeenCalledTimes(1);
    expect(servicio.registro.mock.calls[0][0].nombre).toBe('Ana');
    respuesta.next({});
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registro: 'ok' } });
  });
});
