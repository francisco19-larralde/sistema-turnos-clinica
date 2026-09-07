import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { Perfil } from './perfil';

describe('Mi perfil', () => {
  function preparar() {
    const respuesta = new Subject<any>();
    const usuario = { id: 7, nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', rol: 'PACIENTE', paciente: { id: 1, dni: '12345678', fechaNacimiento: '2000-09-18T00:00:00.000Z', telefono: null }, profesional: null };
    const auth = { perfil: vi.fn(() => of(usuario)), actualizarPerfil: vi.fn(() => respuesta) };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }, { provide: EspecialidadService, useValue: {} }] });
    const componente = TestBed.runInInjectionContext(() => new Perfil());
    componente.ngOnInit();
    return { componente, auth, respuesta, usuario };
  }
  it('conserva la fecha, envía datos del paciente y evita el doble envío', () => {
    const { componente, auth, respuesta, usuario } = preparar();
    expect(componente.formulario.controls.fechaNacimiento.value).toBe('2000-09-18');
    componente.enviar(); componente.enviar();
    expect(auth.actualizarPerfil).toHaveBeenCalledTimes(1);
    expect(auth.actualizarPerfil).toHaveBeenCalledWith({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', dni: '12345678', fechaNacimiento: '2000-09-18', telefono: '' });
    respuesta.next(usuario);
    expect(componente.exito()).toBe(true);
    expect(componente.guardando()).toBe(false);
  });
  it('no envía contraseñas sin confirmar o sin la actual', () => {
    const { componente, auth } = preparar();
    componente.formulario.patchValue({ nuevaContrasena: 'nueva1234', confirmarContrasena: 'nueva1234' });
    componente.enviar();
    expect(auth.actualizarPerfil).not.toHaveBeenCalled();
    componente.formulario.patchValue({ contrasenaActual: 'actual123', confirmarContrasena: 'diferente' });
    componente.enviar();
    expect(auth.actualizarPerfil).not.toHaveBeenCalled();
  });
});
