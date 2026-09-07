import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AgendaDiaria } from './agenda-diaria';
import { MatrizTurnos } from '../turnos-matriz/turnos';
import { TurnoService } from '../../../core/services/turno.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { Turno } from '../../../core/models/turno.model';

describe('Agenda y navegación semanal', () => {
  it('combina filtros y cambia de fecha', () => {
    TestBed.configureTestingModule({ providers: [{ provide: TurnoService, useValue: {} }] });
    const agenda = TestBed.runInInjectionContext(() => new AgendaDiaria());
    const turno: Turno = {
      id: 1, version: 0, fecha: '2026-09-11T00:00:00.000Z', horaInicio: '09:00', horaFin: '09:30', estado: 'PENDIENTE',
      paciente: { id: 1, usuario: { nombre: 'María', apellido: 'Pérez' } },
      profesional: { id: 2, usuario: { nombre: 'Ana', apellido: 'López' }, especialidad: { nombre: 'Clínica' } },
    };
    agenda.turnos.set([turno, { ...turno, id: 2, fecha: '2026-09-12T00:00:00.000Z' }]);
    agenda.seleccionarFecha(new Date(2026, 8, 11));
    agenda.profesionalId.set(2);
    agenda.estado.set('PENDIENTE');
    agenda.busqueda.set('maria perez');
    expect(agenda.filtrados().map(t => t.id)).toEqual([1]);
    agenda.estado.set('CONFIRMADO');
    expect(agenda.filtrados()).toEqual([]);
    agenda.limpiarFiltros();
    agenda.moverDia(1);
    expect(agenda.filtrados().map(t => t.id)).toEqual([2]);
  });

  it('cambia de semana, avisa al formulario y vuelve al período actual', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: DisponibilidadService, useValue: { listarPorProfesional: () => of([]) } },
      { provide: TurnoService, useValue: {} },
    ] });
    const matriz = new MatrizTurnos(TestBed.inject(DisponibilidadService), TestBed.inject(TurnoService));
    let cambios = 0;
    matriz.periodoCambiado.subscribe(() => cambios++);
    const inicial = matriz.rangoVisible();
    matriz.cambiarSemana(1);
    expect(matriz.semana()).toBe(1);
    expect(matriz.rangoVisible()).not.toBe(inicial);
    expect(cambios).toBe(1);
    matriz.volverAHoy();
    expect(matriz.rangoVisible()).toBe(inicial);
    matriz.cambiarSemana(-1);
    expect(matriz.semana()).toBe(0);
  });
});
