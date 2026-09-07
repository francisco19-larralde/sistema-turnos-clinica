import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TablaRemota } from './tabla-remota';

describe('Tabla remota', () => {
  it('solicita una página filtrada y descarta la petición anterior', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const tabla = TestBed.runInInjectionContext(() => new TablaRemota<{ id: number }>('turnos'));
    tabla.cargar({ first: 0, rows: 10 });
    const anterior = http.expectOne(req => req.params.get('pagina') === '1');
    tabla.cargar({ first: 25, rows: 25, filters: { global: { value: 'Ana' }, estado: { value: 'PENDIENTE' }, fecha: { value: '2026-09-18' } } });
    expect(anterior.cancelled).toBe(true);
    const solicitud = http.expectOne(req => req.url.endsWith('/turnos/pagina'));
    expect(solicitud.request.params.get('pagina')).toBe('2');
    expect(solicitud.request.params.get('limite')).toBe('25');
    expect(solicitud.request.params.get('busqueda')).toBe('Ana');
    expect(solicitud.request.params.get('fecha')).toBe('2026-09-18');
    solicitud.flush({ datos: [{ id: 26 }], total: 60, pagina: 2, limite: 25 });
    expect(tabla.datos()).toEqual([{ id: 26 }]);
    expect(tabla.total()).toBe(60);
    http.verify();
  });

  it('retrocede cuando se elimina el último registro de una página', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const tabla = TestBed.runInInjectionContext(() => new TablaRemota('pacientes'));
    tabla.cargar({ first: 10, rows: 10 });
    http.expectOne(req => req.params.get('pagina') === '2').flush({ datos: [], total: 10, pagina: 2, limite: 10 });
    http.expectOne(req => req.params.get('pagina') === '1').flush({ datos: [{ id: 1 }], total: 10, pagina: 1, limite: 10 });
    expect(tabla.primero()).toBe(0);
    expect(tabla.cargando()).toBe(false);
    http.verify();
  });
});
