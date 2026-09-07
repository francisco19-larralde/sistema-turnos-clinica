import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Turno } from '../../../core/models/turno.model';
import { TurnoService } from '../../../core/services/turno.service';
import { ReprogramarTurno } from './reprogramar-turno';

describe('Pantalla de reprogramación', () => {
  const original: Turno = {
    id: 1, version: 0, fecha: '2099-09-11T00:00:00.000Z', horaInicio: '09:00', horaFin: '09:30', estado: 'CONFIRMADO',
    paciente: { id: 2, usuario: { nombre: 'Ana', apellido: 'Pérez' } },
    profesional: { id: 3, usuario: { nombre: 'Juan', apellido: 'López' }, especialidad: { nombre: 'Clínica' } },
  };

  function preparar() {
    const respuesta = new Subject<Turno>();
    const servicio = { reprogramar: vi.fn(() => respuesta) };
    TestBed.configureTestingModule({ providers: [
      { provide: TurnoService, useValue: servicio },
      { provide: ActivatedRoute, useValue: {} },
    ] });
    const componente = TestBed.runInInjectionContext(() => new ReprogramarTurno());
    componente.turno.set(original);
    componente.seleccion.set({ fecha: '2099-09-18', hora: '11:00' });
    componente.motivo = 'Cambio de horario';
    return { componente, respuesta, servicio };
  }

  it('conserva la información original si el servidor rechaza el cambio', () => {
    const { componente, respuesta, servicio } = preparar();
    componente.guardar();
    componente.guardar();
    expect(servicio.reprogramar).toHaveBeenCalledTimes(1);
    respuesta.error({ error: { mensaje: 'El horario ya está ocupado' } });
    expect(componente.turno()).toEqual(original);
    expect(componente.error()).toBe('El horario ya está ocupado');
    expect(componente.guardando()).toBe(false);
    expect(componente.seleccion()).toBeNull();
  });

  it('actualiza el turno y el historial después de guardar', () => {
    const { componente, respuesta, servicio } = preparar();
    componente.guardar();
    expect(servicio.reprogramar).toHaveBeenCalledWith(1, {
      fecha: '2099-09-18', horaInicio: '11:00', motivo: 'Cambio de horario', version: 0,
    });
    respuesta.next({ ...original, version: 1, fecha: '2099-09-18T00:00:00.000Z', horaInicio: '11:00', estado: 'PENDIENTE' });
    expect(componente.turno()?.estado).toBe('PENDIENTE');
    expect(componente.revision()).toBe(1);
    expect(componente.motivo).toBe('');
  });
});
